// Electrode Object without being an extension of THREE.Group Class
function Electrode(elecData) {
    const data = elecData.getData();
    this.row = elecData;
    this.name = data['fullname'];
    this.elecid = data['elecid'];
    this.color = data['color'];
    this.size = data['size'];
    this.shape = data['shape'];
    this.coords = data['coords'];
    this.threeObj = null;
    this._Mesh = null;
    this._TextMesh = null;
    this._elecSize = 1;
    this._textSize = 1;
    this.img = null;
    //this.init();
    this.createThreeObj = function() {
        this.threeObj = new THREE.Group();
        this.threeObj.scale.set(this.getSize(),this.getSize(),this.getSize());
        this.threeObj.position.set(this.coords[0],this.coords[1],this.coords[2]);
        this.threeObj.type = "Electrode";
        this.threeObj.name = this.name;
        this.createElecMesh();
        this.createTextMesh();
        this.row.update({"scObj": this});
    };
    this.createImage = function() {
        const imgSrc = this.row.getData()['PICS'];
        if (imgSrc !== undefined) {
            let elecImg = document.createElement("IMG");
            elecImg.src = imgSrc;
            elecImg.id = this.name + "-elecImg"
            elecImg.className = "elecImg";
            elecImg.classList.add('w3-display-center');
            elecImg.row = this.row;
            elecImg.onclick = function (event) {
                if (event.shiftKey) {
                    this.row.getData().scObj.destroyImg();
                    imgHolder.nextSlide(-1);
                }
            }
            this.img = elecImg;
        }
    };
    this.createElecMesh = function() {
        const eShape = this.getShape();
        let mesh = aes['shapeGuide'][eShape](this._elecSize);
        //const mesh = shapeGuide[this.shape](this._elecSize);
        const mat = new THREE.MeshLambertMaterial({
            color: this.getColor()
        });
        this._Mesh = new THREE.Mesh(mesh, mat);
        this.threeObj.add(this._Mesh);
    };
    this.createTextMesh = function () {
        const geom = new THREE.TextBufferGeometry(this.elecid, {
            font: sc.font,
            size: this._textSize,
            height: 0.1
        });
        const mat = new THREE.MeshBasicMaterial({
            color: this.getColor()
        });
        this._TextMesh = new THREE.Mesh(geom, mat);
        this._TextMesh.position.z = this.getSize();
        this._TextMesh.type = "elecText";
        this._TextMesh.visible = aes.elecTextVisible;
        this._TextMesh.onAfterRender = function() {
            const camera = sc.scenes.threeD.camera;
            this.lookAt(camera.position.x,camera.position.y,camera.position.z);
            this.rotation.setFromRotationMatrix(camera.matrix);
        }
        this.threeObj.add(this._TextMesh);
    };
    this.getColor = function() { 
        return this.color == "default" ? aes['default']['color'] : this.color;
    };
    this.setColor = function(newColor) {
        this.color = newColor;
        if (this.threeObj!== null) {
            newColor = this.getColor();
            this._Mesh.material.color = new THREE.Color(newColor);
            this._TextMesh.material.color = new THREE.Color(newColor);
        }
    };
    this.getElecSize = function() {
        return this._elecSize;
    };
    this.setElecSize = function(newSize) {
        this._elecSize = newSize;
        if (this.threeObj!== null) {
            this._Mesh.scale.set(newSize,newSize,newSize);
        }
    };
    this.getTextSize = function() {
        return this._textSize;
    };
    this.setTextSize = function(newSize) {
        this._textSize = newSize;
        if (this.threeObj!== null) {
            this._TextMesh.scale.set(newSize,newSize,newSize);
        }
    };
    this.getSize = function() { 
        return this.size === "default" ? aes['default']['size'] : this.size;
    };
    this.setSize = function(newSize) {
        this.size = newSize;
        if (this.threeObj!== null) {
            newSize = this.getSize();
            this.threeObj.scale.set(newSize,newSize,newSize);
        }
    };
    this.getShape = function() { 
        return this.shape == "default" ? aes['default']['shape'] : this.shape;
    };
    this.setShape = function(newShape) {
        this.shape = newShape;
        if (this.threeObj!== null) {
            newShape = this.getShape();
            this.threeObj.remove(this._Mesh);
            this._Mesh = null;
            this.createElecMesh();
        }
    };
    this.update = function() {
        const rowColor = this.row.getData()['color'];
        const rowSize = this.row.getData()['size'];
        const rowShape = this.row.getData()['shape'];
        if (this.threeObj !== null) {
            this.setShape(rowShape);
            this.setColor(rowColor);
            this.setSize(rowSize);
        }
    };
    this.destroyObj = function() {
        if (this.threeObj !== null) {

            // If static image exists, remove it
            /*if (this.threeObj.img !== null) {
                this.threeObj.img.remove();
            }*/


            this.threeObj.parent.remove(this.threeObj);
            this.threeObj = null;
        }
        this.row.update({"scObj": this});
    };
    this.destroyImg = function() {
        /*this.img.remove();
        this.img = null;
        this.row.update({"scObj": this});*/
        //document.getElementById(this.name + '-img').remove();
        if (this.img !== null) {
            this.img.remove();
            if (imgHolder._slideShowEnabled) {
                imgHolder.nextSlide(-1);
            }
        }
        this.img = null;
        this.row.update({"scObj": this});
    };
    this.snap2surf = function(meshname) {
        //debugger;
        let mesh = sc.scenes.threeD.scene.getObjectByName(meshname);
        let numVertices = mesh.geometry.vertices.length;
        let vertexIndex = null;
        let currentPosition = new THREE.Vector3(this.coords[0],this.coords[1],this.coords[2]);
        let d,minDist;
        //debugger;
        let currentDistance = 999;
        for (ii=0;ii<numVertices;ii++) {
            d = currentPosition.distanceTo(mesh.geometry.vertices[ii]);
            if (d <= currentDistance) {
                //minDist = d
                currentDistance = d;
                vertexIndex = ii;
            }
        }
        //debugger;
        let vertexPosition = mesh.geometry.vertices[vertexIndex];
        this.move_location(vertexPosition);
    };
    this.move_location = function(newPosition,factor=1) {
        //debugger;
        let currentPosition = new THREE.Vector3(this.coords[0],this.coords[1],this.coords[2]);
        let current2origin = currentPosition.distanceTo(new THREE.Vector3(0,0,0));
        let new2origin = newPosition.distanceTo(new THREE.Vector3(0,0,0));
        if (current2origin > new2origin) {
            newPosition.addScalar(factor);
        } else {
            newPosition.subScalar(factor);
        }
        //let directionVector = new THREE.Vector3().subVectors(relativePosition,currentPosition);
        //let newPosition = directionVector.multiplyScalar(factor);
        if (this.threeObj !== null) {
            this.threeObj.position.set(newPosition.x,newPosition.y,newPosition.z);
        }
        //this.coords = newPosition;
        //this.row.update({'coords': newPosition});
    };
    this.init = function(threed=true,staticImg=true) {
        if (threed && this.threeObj === null) {
            //this.createElecMesh();
            //this.createTextMesh();
            //this.threeObj.scale.set(this.size,this.size,this.size);
            this.createThreeObj();
        }
        /*if (staticImg && this.img === null) {
            this.createImage();
        }*/
        this.row.update({"scObj": this});
    };

    // Method to display electrode (JUST STARTED)
    this.show = function(threed=true,staticImg=true) {
        
        // Create 3D Mesh
        if (threed && this.threeObj === null) {
            this.init(threed,staticImg);
        }

        // Add Mesh to Scene
        if (sc.elecScene.getObjectByName(this.name) === undefined) {
            sc.elecScene.add(this.threeObj);
        } else {
            scObj.update();
        }

        // Create Static Image
        if (staticImg && this.img === null && this.row.getData()['PICS'] !== "") {
            let imgDOM = imgHolder.appendImg(this.row.getData()['PICS'],this.name + '-img');
            
            let elecparent = this;
            //elecImg.onclick = function (event) {
            imgDOM.onclick = function (event) {
                if (event.shiftKey) {
                    elecparent.hide();
                    elecparent.row.update({'img': null});
                }
            }
            this.img = imgDOM;
        }

        this.row.update({'isVisible': true});
    };

    // Method to hide electrode
    this.hide = function () {
        if (this.threeObj !== null || this.img !== null) {
            this.destroyObj();

            /*if (this.img !== null) {
                this.img.remove();
                if (imgHolder._slideShowEnabled) {
                    imgHolder.nextSlide(-1);
                }
            }*/
        }

        // If object is visible in static image scene, delete it
        if (this.img !== null) {
            this.destroyImg();
        }

        this.row.update({
            'isVisible': false
        });
    }

}