// New object to help searching and filtering and changing aesthetics

//#region For 2D canvases
function makeLabelCanvas(baseWidth, size, name) {
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const font =  `${size}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(name, 0, 0);

    return ctx.canvas;
}


baseWidth = 10;
size = 10;
name = "elecSample";
borderSize = 2;
ctx = document.createElement('canvas').getContext('2d');
font =  `${size}px bold sans-serif`;
ctx.font = font;
// measure how long the name will be
textWidth = ctx.measureText(name).width;
doubleBorderSize = borderSize * 2;
width = baseWidth + doubleBorderSize;
height = size + doubleBorderSize;
ctx.canvas.width = width;
ctx.canvas.height = height;
// need to set font again after resizing canvas
ctx.font = font;
ctx.textBaseline = 'middle';
ctx.textAlign = 'center';
ctx.fillStyle = 'blue';
ctx.fillRect(0, 0, width, height);

// scale to fit but don't stretch
scaleFactor = Math.min(1, baseWidth / textWidth);
ctx.translate(width / 2, height / 2);
ctx.scale(scaleFactor, 1);
ctx.fillStyle = 'white';
ctx.fillText(name, 0, 0);

//canvas2D = makeLabelCanvas(labelWidth, size, name);
texture = new THREE.CanvasTexture(ctx.canvas);
// because our canvas is likely not a power of 2
// in both dimensions set the filtering appropriately.
texture.minFilter = THREE.LinearFilter;
texture.wrapS = THREE.ClampToEdgeWrapping;
texture.wrapT = THREE.ClampToEdgeWrapping;

labelMaterial = new THREE.SpriteMaterial({
   map: texture,
   transparent: true,
});

label = new THREE.Sprite(labelMaterial);
sc.scenes.threeD.scene.add(label);
//#endregion

//#region Playing with classes/objects
x = {
    f: class {
        constructor(x) {
            this.x = x;
        } 
    }, 
    g: class extends Car { 
        constructor(name, year) {
            super(name, year);
        }
    },
    objs: []
}


class Car {
    constructor(name, year) {
      this.name = name;
      this.year = year;
    }
}
Object.defineProperty(Car.constructor.prototype,'y2', {
    get: function() {return this.y2;},
    set: function(this) {this.year + 1000}
})

givenOutcome = {color: 'default', size: 'default', shape: 'cube'};
row = {color: 'default', size: 3, shape: 'default'};
//#endregion


//#region Animate 2D scenes
// For creating 2D interactive scenes
// Making scenes for 2D planar slices
var div2d = document.getElementById("plane-coronal");
var obj = vol['Coronal'].parent;
var renderer2d = new THREE.WebGLRenderer({
    antialias: true
});
renderer2d.setSize(div2d.offsetWidth, div2d.offsetHeight);
renderer2d.setClearColor(0xffffff, 1);
renderer2d.setPixelRatio(window.devicePixelRatio);
div2d.appendChild(renderer2d.domElement);

cameraPole = new THREE.Group();
material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
points = [];
points.push( new THREE.Vector3(0, 200, 0 ) );
points.push( new THREE.Vector3( 0, 0, 0 ) );
geometry = new THREE.BufferGeometry().setFromPoints( points );
line = new THREE.Line( geometry, material );
//cameraPole.add(line);
// camera
var camera = new AMI.OrthographicCamera(
renderer2d.domElement.clientWidth / -2,
renderer2d.domElement.clientWidth / 2,
renderer2d.domElement.clientHeight / 2,
renderer2d.domElement.clientHeight / -2,
1,
1000
);
/*let camera = new THREE.PerspectiveCamera(45, renderer2d.domElement.clientWidth / renderer2d.domElement.clientHeight, 1, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 20*10;*/

sg = new THREE.SphereBufferGeometry(3, 32, 32);
sm = new THREE.MeshBasicMaterial({color: 'red'});
s = new THREE.Mesh(sg,sm);
line.add(s);
//obj.add(cameraPole);

s.add(camera);
s.position.set(0,200,0);
camera.lookAt(0,0,0);
obj.add(line)

// controls
/*var controls = new AMI.TrackballOrthoControl(camera, renderer2d.domElement);
controls.staticMoving = true;
controls.noRotate = true;
camera.controls = controls;*/


function div2dAnimate () {
    //controls.update();
    renderer2d.render(obj, camera);

    requestAnimationFrame(function () {
        div2dAnimate();
    });
}
div2dAnimate();




//#endregion

//#region Playing with Aesthetics

// Add the needed fields to parsed data
function setupElecRow(elecData) {

    // If it's an older version of elec json then use lepto field for coordinates
    if (!elecData.hasOwnProperty('coords') && elecData.hasOwnProperty('lepto')) {
        elecData['coords'] = elecData['lepto'];
    }

    // Add clinical fields
    const neededFields = ['motor', 'sensory', 'visual', 'auditory', 'language', 'soz', 'spikey'];
    for (field of neededFields) {
        if (!elecData.hasOwnProperty(field)) {
            elecData[field] = false;
        }
    }

    // Add aesthetic fields
    const aesFields = ['shape', 'color', 'size'];
    for (field of aesFields) {
        if (!elecData.hasOwnProperty(field)) {
            elecData[field] = "default";
        }
    }

    // Holder for electrode object that will be added to 3D scene
    elecData['scObj'] = null;

    return elecData;
}

var aes = {
    default: {shape: "sphere", color: "black",size: 2}, //aesDefaults,
    custom: [
        {
            criteria: [{field: "motor", type: "=",value: true}],
            outcome: {shape: "cube"}
        },
        {
            criteria: [{field: "sensory", type: "=",value: true}],
            outcome: {shape: "dodecahedron"}
        },
        {
            criteria: [{field: "visual", type: "=",value: true}],
            outcome: {shape: "tetrahedron"}
        },
        {
            criteria: [{field: "auditory", type: "=",value: true}],
            outcome: {shape: "cone"}
        },
        {
            criteria: [{field: "language", type: "=",value: true}],
            outcome: {shape: "octahedron"}
        },
        {
            criteria: [{field: "soz", type: "=",value: true}],
            outcome: {color: "red", size: 3}
        },
        {
            criteria: [{field: "spikey", type: "=",value: true}],
            outcome: {color: "green", size: 3}
        }
    ],
    shapeGuide: {
        cube: (h) => new THREE.BoxBufferGeometry(h, h, h),
        sphere: (r) => new THREE.SphereBufferGeometry(r, 32, 32),
        dodecahedron: (r) => new THREE.DodecahedronBufferGeometry(r, 0),
        tetrahedron: (r) => new THREE.TetrahedronBufferGeometry(r, 0),
        cone: (r) => new THREE.ConeBufferGeometry(r, r, 10),
        octahedron: (r) => new THREE.OctahedronBufferGeometry(r,0),
    },
    resetAesthetics: function(selected=false) {
        if (selected === true) {
            let rows2Update = sc.elecTable.obj.getSelectedRows();
        } else {
            let rows2Update = sc.elecTable.obj.getRows();
        }
        rows2Update.forEach(function(r) {
            r.update({color: 'default', size: 'default', shape: 'default'});
        });
    },
    updateRowValues: function(selected=false) {
        let customAes = this.custom;
        for (a of customAes) {
            let foundRows = sc.elecTable.obj.searchRows(a['criteria']);
            if (foundRows.length !== 0) {
                foundRows.forEach(function (r) {
                    if (selected === true) {
                        if (r.isSelected()) {r.update(a['outcome']);}
                    } else {
                        r.update(a['outcome']);
                    }
                })
            }
        }
    },
    updateScObjs: function(selected=false) {
        if (selected === true) {
            let rows2Update = sc.elecTable.obj.getSelectedRows();
        } else {
            let rows2Update = sc.elecTable.obj.getRows();
        }
        rows2Update.forEach( function(r) {
            if (r.getData()['scObj'] !== null) {
             r.getData()['scObj'].update();
            }
        });
    },
    updateAesthetics: function(selected=false) {
        this.resetAesthetics(selected);
        this.updateRowValues(selected);
        this.updateScObjs(selected);
    }
};

// Electrode Object without being an extension of THREE.Group Class
function Electrode(elecData) {
    const data = elecData.getData();
    this.row = elecData;
    this.name = data['elecid'];
    this.color = data['color'];
    this.size = data['size'];
    this.shape = data['shape'];
    this.threeObj = null;
    this._Mesh = null;
    this._TextMesh = null;
    this._elecSize = 1;
    this._textSize = 1;
    this.img = null;
    //this.init();
    this.createThreeObj = function() {
        this.threeObj = new THREE.Group();
        this.threeObj.scale.set(this.size,this.size,this.size);
        this.threeObj.type = "Electrode";
        this.createElecMesh();
        this.createTextMesh();
        this.row.update({"scObj": this});
    };
    this.createImage = function() {
        const imgSrc = this.row.getData()['PICS'];
        if (imgSrc !== undefined) {
            let elecImg = document.createElement("IMG");
            elecImg.src = imgSrc;
            elecImg.className = "elecImg";
            elecImg.classList.add('w3-display-center');
            elecImg.onclick = function (event) {
                if (event.shiftKey) {
                    elecImg.remove();
                    imgHolder.nextSlide(-1);
                }
            }
            this.img = elecImg;
        }
    }
    this.createElecMesh = function() {
        const eShape = this.getShape();
        mesh = shapeGuide[eShape](this._elecSize);
        //const mesh = shapeGuide[this.shape](this._elecSize);
        const mat = new THREE.MeshLambertMaterial({
            color: this.getColor()
        });
        this._Mesh = new THREE.Mesh(mesh, mat);
        this.threeObj.add(this._Mesh);
    };
    this.createTextMesh = function () {
        const geom = new THREE.TextBufferGeometry(this.name, {
            font: sc.font,
            size: this._textSize,
            height: 0.1
        });
        const mat = new THREE.MeshBasicMaterial({
            color: this.getColor()
        });
        this._TextMesh = new THREE.Mesh(geom, mat);
        this._TextMesh.position.z = this.size + 2;
        this._TextMesh.type = "elecText";
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
        this._Mesh.material.color = new THREE.Color(newColor);
        this._TextMesh.material.color = new THREE.Color(newColor);
    };
    this.getElecSize = function() {
        return this._elecSize;
    };
    this.setElecSize = function(newSize) {
        this._Mesh.scale.set(newSize,newSize,newSize);
    };
    this.getTextSize = function() {
        return this._textSize;
    };
    this.setTextSize = function(newSize) {
        this._TextMesh.scale.set(newSize,newSize,newSize);
    };
    this.getSize = function() { 
        return this.size == "default" ? aes['default']['size'] : this.size;
    };
    this.setSize = function(newSize) {
        this.size = newSize;
        this.threeObj.scale.set(newSize,newSize,newSize);
    };
    this.getSize = function() { 
        return this.shape == "default" ? aes['default']['shape'] : this.shape;
    };
    this.getShape = function() { 
        return this.shape == "default" ? aes['default']['shape'] : this.shape;
    };
    this.setShape = function(newShape) {
        if (this.shape !== newShape) {
            this.shape = newShape;
            this.threeObj.remove(this._Mesh);
            this._Mesh = null;
            this.createElecMesh();
        }
    };
    this.update = function() {
        const rowColor = this.row.getData()['color'];
        const rowSize = this.row.getData()['size'];
        const rowShape = this.row.getData()['shape'];
        if (rowColor !== this.color) {this.setColor(rowColor);}
        if (rowSize !== this.size) {this.setSize(rowSize);}
        if (rowShape !== this.shape) {this.setShape(rowShape);}
    };
    this.destroyObj = function() {
        this.threeObj.parent.remove(this.threeObj);
        this.threeObj = null;
        this.row.update({"scObj": null});
    };
    this.destroyImg = function() {
        this.img.remove();
        this.img = null;
    };
    this.init = function() {
        this.createElecMesh();
        this.createTextMesh();
        this.threeObj.scale.set(this.size,this.size,this.size);
        this.row.update({"scObj": this});
    };
}

// Object for DOMs that can hold static images
let imgHolder = {
    domElement1: document.getElementById('elecSlideShow'),
    domElement2: document.getElementById('elecStatic'),
    activeDOM: document.getElementById('elecSlideShow'),
    inactiveDOM: document.getElementById('elecStatic'),
    leftButton: document.getElementById('slideshow-bttn-l'),
    rightButton: document.getElementById('slideshow-bttn-r'),
    _slideShowEnabled: false,
    _slideShowIndex: -1,
    visible: null,
    imgs: [],
    enableSlideShow: function () {
        this.leftButton.classList.remove('w3-disabled');
        this.leftButton.disabled = false;
        /*this.leftButton.addEventListener('click', function() {
            debugger;
            this.nextSlide(-1);
        });*/
        this.rightButton.classList.remove('w3-disabled');
        this.rightButton.disabled = false;
        /*this.rightButton.onclick = addEventListener('click', function() {
            this.nextSlide(1);
        });*/
        this._slideShowEnabled = true;
    },
    disableSlideShow: function () {
        this.leftButton.classList.add('w3-disabled');
        this.leftButton.disabled = true;
        //this.leftButton.onclick = null;
        this.rightButton.classList.add('w3-disabled');
        this.rightButton.disabled = true;
        //this.rightButton.onclick = null;
        this._slideShowEnabled = false;
    },
    createImg: function(src) {
        if (src !== undefined) {
            let elecImg = document.createElement("IMG");
            elecImg.src = src;
            elecImg.className = "elecImg";
            elecImg.classList.add('w3-display-center');
            elecImg.onclick = function (event) {
                if (event.shiftKey) {
                    //imgHolder.imgs.splice(this._slideShowIndex,1);
                    elecImg.remove();
                    imgHolder.nextSlide(-1);
                }
            }
            return elecImg;
        }
    },
    appendImg: function (srcData) {
        htmlImg = this.createImg(srcData);
        $(htmlImg).hide();
        //this.imgs.push(htmlImg);
        if (!this._slideShowEnabled && this.domElement1 == this.activeDOM) {
            this.enableSlideShow();
        }
        this.activeDOM.appendChild(htmlImg);
        this.imgs.push(htmlImg);
        if (this.domElement1 == this.activeDOM) {
            this.nextSlide(1);
        }
        //this.activeDOM.appendChild(htmlImg);
    },
    destroyImgs: function () {
        forEach(this.imgs, function (ii) {
            ii.remove();
        });
        this.disableSlideShow();
        this._slideShowIndex = -1;
    },
    changeDOM: function () {
        forEach(this.imgs, function (ii) {
            this.inactiveDOM.appendChild(ii);
        });
        let newlyActiveDOM = this.inactiveDOM;
        let newlyInactiveDOM = this.activeDOM;
        this.activeDOM = newlyActiveDOM;
        this.inactiveDOM = newlyInactiveDOM;
        if (this.domElement1 == this.activeDOM) {
            this.enableSlideShow();
        } else {
            this.disableSlideShow();
        }
    },
    nextSlide: function (step) {
        let currentSlide = this.imgs[this._slideShowIndex];
        let maxSlideIndex = this.imgs.length - 1;
        this._slideShowIndex += step;
        //console.log('Now on slide index' + this._slideShowIndex.toString());
        if (this.imgs.length === 0 && this.activeDOM === this.domElement1) {
            this.disableSlideShow();
            this._slideShowIndex = -1;
            console.log('Now on slide index' + this._slideShowIndex.toString());
            return;
        } else if (this._slideShowIndex > maxSlideIndex) {
            this._slideShowIndex = 0;
            console.log('Now on slide index' + this._slideShowIndex.toString());
        } else if (this._slideShowIndex < 0) {
            this._slideShowIndex = maxSlideIndex;
            console.log('Now on slide index' + this._slideShowIndex.toString());
        }
        let nextSlide = this.imgs[this._slideShowIndex];
        if (currentSlide !== undefined) {
            $(currentSlide).hide();
        }
        $(nextSlide).css('display','block');
    }
};

// Class for electrodes and all its' stuff (THREE.JS Group extension)
class electrodeObject extends THREE.Group {
    constructor(elecData) {
        super();
        const data = elecData.getData();
        this.type = "electrode";
        this.row = elecData;
        this.name = data['elecid'];
        this.color = data['color'];
        this.size = data['size'];
        this.shape = data['shape'];
        this.position.x = data['coords'][0];
        this.position.y = data['coords'][1];
        this.position.z = data['coords'][2];
        this._Mesh = null;
        this._TextMesh = null;
        this.img = null;
        this.init();
    }
    createElectrode() {
        const mesh = shapeGuide[this.shape](this.size);
        const mat = new THREE.MeshLambertMaterial({
            color: this.color
        });
        this._Mesh = new THREE.Mesh(mesh, mat);
    }
    createText() {
        const geom = new THREE.TextBufferGeometry(this.name, {
            font: sc.font,
            size: this.size,
            height: 0.1
        });
        const mat = new THREE.MeshBasicMaterial({
            color: this.color
        });
        this._TextMesh = new THREE.Mesh(geom, mat);
        this._TextMesh.position.z = this.size + 2;
        this._TextMesh.type = "elecText";
        const renderer = sc.scenes.threeD.renderer;
        const scene = sc.scenes.threeD.scene;
        const camera = sc.scenes.threeD.camera;
        this._TextMesh.onAfterRender = function(renderer,scene, camera) {
            this.lookAt(camera.position.x,camera.position.y,camera.position.z);
            this.rotation.setFromRotationMatrix(camera.matrix);
        }
    }
    /*createImg() {
        if (this.row.getData()['PICS'] !== undefined) {
            let elecImg = document.createElement("IMG");
            elecImg.src = this.row.getData()['PICS'];
            elecImg.className = "elecImg";
            elecImg.classList.add('w3-display-container');
            elecImg.onclick = function (event) {
                if (event.shiftKey) {
                    elecImg.remove();
                }
            }
            this.img = elecImg;
        }
    }*/
    destroy() {
        this.row.update({scObj: null});
        if (this.img !== null) {
            this.img.remove();
        }
        this.parent.remove(this);
    }
    changeColor(newColor) {
        this.color = newColor;
        this._Mesh.material.color = new THREE.Color(newColor);
        this._TextMesh.material.color = new THREE.Color(newColor);
    }
    changeSize(newSize) {
        this.size = newSize;
        this._Mesh.scale.set(newSize,newSize,newSize);
        this._TextMesh.scale.set(newSize,newSize,newSize);
    }
    changeShape(newShape) {
        this.shape = newShape;
        this.remove(this._Mesh);
        this._Mesh = null;
        this.createElectrode();
        this.add(this._Mesh);
    }
    update() {
        const rowColor = this.row.getData()['color'];
        const rowSize = this.row.getData()['size'];
        const rowShape = this.row.getData()['shape'];
        if (rowColor !== this.color) {this.changeColor(rowColor);}
        if (rowSize !== this.size) {this.changeSize(rowSize);}
        if (rowShape !== this.shape) {this.changeShape(rowShape);}
    }
    init() {
        this.createElectrode();
        this.createText();
        //this.createImg();
        this.add(this._Mesh);
        this.add(this._TextMesh);
        this.row.update({
            "scObj": this
        });
    }
}

// Update electrodes when update button pressed
/*function updateElecRows() {
    let customAes = aes['custom'];
    for (a of customAes) {
        let foundRows = sc.elecTable.obj.searchRows(a['criteria']);
        if (foundRows.length !== 0) {
            foundRows.forEach(function (r) {
                r.update(a['outcome']);
                if (r.getData()['scObj'] !== null) {
                    r.getData()['scObj'].update();
                }
            })
        }
    }
}*/

// 1) Set all back to default
let customAes = aes['custom'];
et = sc.elecTable.obj;
et.getRows().forEach( function(r) {
    r.update({color: 'default', size: 'default', shape: 'default'});
});

// 2) Search through all rows and update them from criteria
for (a of customAes) {
    let foundRows = sc.elecTable.obj.searchRows(a['criteria']);
    if (foundRows.length !== 0) {
        foundRows.forEach(function (r) {
            r.update(a['outcome']);
        })
    }
}

// 3) If scObj exists, then update it
et.getRows().forEach( function(r) {
   if (r.getData()['scObj'] !== null) {
    r.getData()['scObj'].update();
   }
});

// Setup aesthetics once table has been created
function setupAesthetics(elecTable) {

    // First do Tabulator search of table with criteria in custom AES
    aes['custom'].forEach(function (aesCustom) {
        let searchCrit = aesCustom['criteria'];
        let updateParams = aesCustom['outcome'];
        let critRows = elecTable.searchRows(searchCrit);
        if (critRows.length !== 0) {
            critRows.forEach(function (r) {
                r.update(updateParams);
            });
        }
    });
}

// Shapes guide
var shapeGuide = {
    cube: (h) => new THREE.BoxBufferGeometry(h, h, h),
    sphere: (r) => new THREE.SphereBufferGeometry(r, 32, 32),
    dodecahedron: (r) => new THREE.DodecahedronBufferGeometry(r, 0),
    tetrahedron: (r) => new THREE.TetrahedronBufferGeometry(r, 0),
    cone: (r) => new THREE.ConeBufferGeometry(r, r, 10),
    octahedron: (r) => new THREE.OctahedronBufferGeometry(r,0),
};

// elecTable Aesthetics Setter
var aesDefaults = {
    shape: "sphere",
    color: "black",
    size: 2
};


function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 1 + ndx * .1;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
    });

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);




// To download
elecTable.setGroupBy('') // Can't be grouped

// Complex values give issue to the table, maybe store in a tmp variable and then bring back after download complete
elecTable.getRows().forEach(function(r) {r.update({scObj: null, PICS: ''})}) 

// Special fileformatter to customize data
var fileFormatter = function(list, options, setFileContents){ debugger;}

// Download function
sc.elecTable.obj.download(fileFormatter,'data6.csv',{})


m = sc.scenes.threeD.scene.getObjectByName('lh.pial');
numVerts = m.geometry.vertices.length;
minDist = 10;
vertIndex = null;
elec = sc.elecScene.getObjectByName('LGrid60');
pos = elec.position;
for (ii=0;ii<numVerts;ii++) {
    d = pos.distanceTo(m.geometry.vertices[ii]);
    if (d <= minDist) {
        minDist = d
        vertIndex = ii;
    }
}
vertPos = m.geometry.vertices[vertIndex];
directionVert = new THREE.Vector3().subVectors(vertPos,pos);
doubleDirectionVert = directionVert.multiplyScalar(2);
newPos = new THREE.Vector3().addVectors(doubleDirectionVert,pos)
elec.position.set(newPos.x,newPos.y,newPos.z)

// Regex filter function
let input = 'l*'
let re = new RegExp(input,'i');
let rowid = 'LTx11';
let outcome = rowid.match(re);



children=['lh.pial','lh.white','lh.hippocampus','rh.pial','rh.white','rh.hippocampus']
for (x of children) {
    o = sc.scenes.threeD.scene.getObjectByName(x);
    o.renderOrder = 10;
    o.material.depthWrite = false;
    o.material.depthTest = true;
    o.material.needsUpdate = true;
}



o.material.depthWrite = false;
o.material.depthTest = true;
o.materialside = THREE.FrontSide;
o.material.needsUpdate = true;



elecTable.obj.getColumns()[1].getDefinition()['title']

cols = elecTable.obj.getColumns();
validCols = [];
for (c of cols) {
    if (c.getDefinition()['title']) {
        validCols.push({[c.getField()]: c.getDefinition()['title']});
    }
}