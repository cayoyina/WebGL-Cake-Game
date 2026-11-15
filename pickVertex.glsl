#version 300 es

in vec3 aPosition;
//cake pieces ID
in float aFaceID;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

//no interpolierung = same ID for whole triiangle
flat out float vFaceID;

void main()
{
    //sent to pickfragment
    vFaceID = aFaceID;

    gl_Position =
        uProjectionMatrix *
        uModelViewMatrix *
        vec4(aPosition, 1.0);
}