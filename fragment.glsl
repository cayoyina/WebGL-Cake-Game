#version 300 es

precision mediump float; //new

flat in float vFaceID; //new
//script 323, 78
uniform float uEatenFaces[500]; //new

out vec4 outColor;

//new
void main() {

    bool eaten = false;

    for(int i = 0; i < 500; i++) {


        if(vFaceID == uEatenFaces[i]) {
            eaten = true;
        }
    }

    if(eaten) {
        outColor = vec4(0.84f, 0.45f, 0.89f, 0.0f);
    } else {
        outColor = vec4(0.84f, 0.45f, 0.89f, 1.0f);
    }

}