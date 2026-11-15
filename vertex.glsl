#version 300 es

in vec3 aPosition;
in float aFaceID; //new

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

flat out float vFaceID;

void main()
{
    vFaceID = aFaceID; //new

    gl_Position =
        uProjectionMatrix *
        uModelViewMatrix *
        vec4(aPosition, 1.0);
}

