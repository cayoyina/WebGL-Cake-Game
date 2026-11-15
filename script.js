import { fetchShaderTexts } from "./utils/fetchShader.js";
import * as mat4 from "./utils/mat4.js";
import Cake from "./utils/cake.js";
import * as vec3 from "./utils/vec3.js";
const canvas = document.getElementById("myCanvas");

//last mouse pos
let isClicked = false;
let clickPosX = 0;
let clickPosY = 0;

canvas.addEventListener("mousedown", (event) => {


    clickPosX = event.clientX;
    clickPosY = event.clientY;

    isClicked = true;
});


canvas.addEventListener("mouseup", () => {

    isClicked = false;
});


canvas.addEventListener("mousemove", (event) => {


    if (isClicked) {



        let deltaX = event.clientX - clickPosX;
        let deltaY = event.clientY - clickPosY;

        //rotate cake
        rotationY += deltaX * 0.01;
        rotationX += deltaY * 0.01;

        clickPosX = event.clientX;
        clickPosY = event.clientY;

    }

});

let nomSound = document.getElementById("nomSound");
canvas.addEventListener("click", () => {

    nomSound.play();
    pickFace();

});

if (!canvas) {
    console.error("no canvas element");
}

/** @type { WebGLRenderingContext } */
const gl = canvas.getContext("webgl2");
gl.disable(gl.CULL_FACE);
gl.enable(gl.DEPTH_TEST);
gl.clearColor(1.0, 0.0, 1.0, 0.2);

//makes transparency possible
gl.enable(gl.BLEND);
//rule for alpha mix
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const cake = new Cake(0.5);

let rotationX = 0;
let rotationY = 0;

//Set: object that stores values but each only once
let eatenFaces = new Set();

let projectionMatrix = mat4.create();
let modelViewMatrix = mat4.create();


//Picking shader -> cake is drawn with IDs -> pixel are read
function pickFace() {

    //start new render for clicking
    gl.clear(
        gl.COLOR_BUFFER_BIT |
        gl.DEPTH_BUFFER_BIT
    );

    //Program is switched to picking program
    gl.useProgram(
        pickingProgram
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(
            pickingProgram,
            "uProjectionMatrix"
        ),
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(
            pickingProgram,
            "uModelViewMatrix"
        ),
        false,
        modelViewMatrix
    );

    //same cake is drawn invisibly with IDs
    gl.drawElements(
        gl.TRIANGLES,
        cake.indices.length,
        gl.UNSIGNED_INT,
        0
    );

//numbers from 0-255, 4 plätze mit jeweils 1 8-bit Zahl
    let pixel = new Uint8Array(4);

    //read the color of a pixel
    gl.readPixels(
        clickPosX,
        canvas.height - clickPosY,
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixel
    );

//Mathematik mit farbwerten, damit sie zusammengesetzt werden, nicht
//auf rot und grün aufgeteilt , zum zerlegen, weil man nur bis 256 lesen kann
    let face =
        pixel[0] +
        pixel[1] * 256;

//Face ID wird in das Set eingefügt
    if (face >= 0) {
        eatenFaces.add(face);
    }

    gl.useProgram(program);
}




if (gl) {
    console.log("WebGL2 is good to go, buffer size:");
    console.log(gl.drawingBufferWidth);
    console.log(gl.drawingBufferHeight);
    console.log(gl);

    gl.getExtension("OES_element_index_uint");

} else {
    console.error("no webgl2 context");
}

function compileShader(type, source, shaderName) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(
            "failed to compile " + shaderName + " shader" + gl.getShaderInfoLog(shader)
        );
    }
    return shader;
}


const shaderSources = await fetchShaderTexts("./vertex.glsl", "./fragment.glsl");
const vertexShader = compileShader(gl.VERTEX_SHADER, shaderSources.vertexShaderText, "vertex");
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, shaderSources.fragmentShaderText, "fragment");
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

const pickingProgram = gl.createProgram();

const pickVertexSource = await 
(await fetch("./pickVertex.glsl")).text();

const pickFragmentSource = await 
(await fetch("./pickFragment.glsl")).text();

const pickVertexShader = compileShader
(gl.VERTEX_SHADER, pickVertexSource, "pick vertex");

const pickFragmentShader = compileShader
(gl.FRAGMENT_SHADER, pickFragmentSource, "pick fragment");

gl.attachShader(
    pickingProgram,
    pickVertexShader
);

gl.attachShader(
    pickingProgram,
    pickFragmentShader
);

gl.linkProgram(
    pickingProgram
);

async function main() {

    //tell cake.js that text = cake.obj
    const response = await fetch('resources/models/cake/cake.obj');
    const text = await response.text();

    cake.load(text);

    let faceIDBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, faceIDBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cake.faceIDs), gl.STATIC_DRAW);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cake.vertices), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cake.colors), gl.STATIC_DRAW);

    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cake.texcoords), gl.STATIC_DRAW);

    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cake.normals), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(cake.indices), gl.STATIC_DRAW);

    connectShaderAttributes(program, "aPosition", positionBuffer, 3, gl.FLOAT, false, 0, 0)
    connectShaderAttributes(program, "aColor", colorBuffer, 4, gl.FLOAT, false, 0, 0)
    connectShaderAttributes(program, "aTexcoord", texcoordBuffer, 2, gl.FLOAT, false, 0, 0)
    connectShaderAttributes(program, "aNormal", normalBuffer, 3, gl.FLOAT, false, 0, 0)
    connectShaderAttributes(program, "aPosition", positionBuffer, 3, gl.FLOAT, false, 0, 0);
    connectShaderAttributes(program, "aFaceID", faceIDBuffer, 1, gl.FLOAT, false, 0, 0);

    function connectShaderAttributes(program, attribName, buffer, size, type, normalized, stride, offset) {
        const attribLocation = gl.getAttribLocation(program, attribName);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(attribLocation, size, type, normalized, stride, offset);
        gl.enableVertexAttribArray(attribLocation);
    }

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;


    //Shader
    const shaderSource = await fetchShaderTexts(
        "./vertex.glsl",
        "./fragment.glsl"
    );
    console.log(shaderSource);


    function compileShader(shader, shaderName) {
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(shaderName + ' shader compiled successfully.');
        } else {
            console.error('Error compiling ' + shaderName + ' shader: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
    }
}

//first main, then start rendering
main().then(() => {
    render();
});


function render() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(modelViewMatrix);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationX, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationY, [0, 1, 0]);

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "uProjectionMatrix"),
        false,
        projectionMatrix
    );

    gl.uniformMatrix4fv(
        gl.getUniformLocation(program, "uModelViewMatrix"),
        false,
        modelViewMatrix
    );

    // gegessene Stücke an Shader schicken, z 323
    //  glsl kennt keine Sets, deswegen Array
    let eatenArray = Array.from(eatenFaces);

    //-1 will not be eaten, describes the length of list (500)
    while (eatenArray.length < 500) {
        eatenArray.push(-1);
    }

    gl.uniform1fv(
        gl.getUniformLocation(program, "uEatenFaces"),
        eatenArray
    );

    gl.drawElements(
        gl.TRIANGLES,
        cake.indices.length,
        //my cake is too large for SHORT
        gl.UNSIGNED_INT,
        0
    );
    requestAnimationFrame(render);
}

