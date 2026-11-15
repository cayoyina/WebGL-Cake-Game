#version 300 es

//floats sollen mit hoher geschwindigkeit berechnet werden
precision highp float;

flat in float vFaceID;

out vec4 outColor;

void main()
{
    //whole number, no comma
    int id = int(vFaceID);

    //color read when mouseclicking 
    outColor = vec4(
        float(id % 256) / 255.0,
        float(id / 256) / 255.0,
        0.0,
        1.0
    );
}