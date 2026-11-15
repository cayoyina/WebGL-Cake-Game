export class Cake {

    constructor(size) {

        this.size = size;
        this.vertices = [];
        this.indices = [];

        this.faceIDs = [];

    }


    load(text) {

        const model = this.parseOBJ(text);

        this.vertices = model.vertices;
        this.indices = model.indices;
        this.faceIDs = model.faceIDs;
    }


    parseOBJ(text) {

        let vertices = [];
        //triangles
        let indices = [];
        let faceIDs = [];

        let faceCounter = 0;

        //\n = "enter", split string in parts every "enter"
        const lines = text.split("\n");



        for (let line of lines) {
            //removes space in front and back, for 43 to work
            line = line.trim();

            //ignore empty or # lines
            if (
                line === "" ||
                line.startsWith("#")
            ) {
                continue;
            }

            // /\s+/ = 1 or more spaces.
            //  each character with no space becomes a part
            let parts = line.split(/\s+/);

            let keyword = parts[0];



            if (keyword === "v") {


                let x = Number(parts[1]);
                let y = Number(parts[2]);
                let z = Number(parts[3]);


                vertices.push(
                    x * this.size,
                    y * this.size,
                    z * this.size
                );

            }


            // 1/2/3
            // │ │ │
            // │ │ └─ Normal            "1",
            // │ └─── Textur   --->     "2",                    
            // └───── Vertex            "3"

            if (keyword === "f") {

                // let currentFace = faceCounter
                let currentFace = Math.floor(faceCounter / 7);

                let a =
                    Number(parts[1].split("/")[0]) - 1;

                let b =
                    Number(parts[2].split("/")[0]) - 1;

                let c =
                    Number(parts[3].split("/")[0]) - 1;


                // first triangle
                indices.push(
                    a, b, c
                );


                faceIDs.push(
                    currentFace,
                    currentFace,
                    currentFace
                );

                faceCounter++;

            }

        }

        //fill arrays
        return {
            vertices,
            indices,
            faceIDs
        };

    }

}


export default Cake;