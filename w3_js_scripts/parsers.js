/**
 * parse Freesurfer Mesh files
 */
function parseFSMesh(idx, files, container, scene) {
    let fsmLoader = new THREE.FreeSurferLoader(container);
    return (
        Promise.resolve()
        // load the file
        .then(function () {
            return new Promise(function (resolve, reject) {
                let myReader = new FileReader();
                // should handle errors too...
                myReader.addEventListener('load', function (e) {
                    resolve(e.target.result);
                    //resolve(e.target.responseText);
                });
                myReader.readAsArrayBuffer(files[idx]);
            });
        })
        .then(function (buffer) {
            //debugger;
            return fsmLoader.parse(buffer);
        })
        .then(function (brainVol) {
            let surfExt = files[idx].name.split('.')[1];
            let currentColor = {
                color: surfColors[surfExt]
            };
            const material = new THREE.MeshLambertMaterial({
                color: currentColor.color, //'rgb(120,120,120)',
                transparent: true
            });
            material.side = THREE.FrontSide;
            brainVol.computeVertexNormals();
            let mesh = new THREE.Mesh(brainVol, material);
            mesh.name = files[idx].name;

            // Choose rendering order
            if (files[idx].name.split('.').pop().toLowerCase() == 'pial') {
                mesh.renderOrder = 10;
            } else {
                mesh.renderOrder = 5;
            }


            //debugger;
            meshFolder = surfFolder.addFolder(files[idx].name);
            meshFolder.add(material, 'opacity', 0, 1).name('Opacity'); // Add folder to viewerGui for this mesh
            var colorchanger = meshFolder.addColor(currentColor, 'color').name("color");
            //debugger;
            colorchanger.onChange(function (colorVal) {
                let newColor = colorVal.replace('#', '0x');
                material.color.setHex(newColor);
            });
            //meshFolder.open();
            /*const RASToLPS = new THREE.Matrix4();
            RASToLPS.set(
                -1, 0, 0, 0, 
                0, -1, 0, 0, 
                0, 0, 1, 0, 
                0, 0, 0, 1);
            mesh.applyMatrix(RASToLPS);*/
            scene.add(mesh);
        })
        .catch(function (error) {
            window.console.log('oops... something went wrong...');
            window.console.log(error);
        })
    );
}


/**
 * parse MGZ files
 */
function parseVolume(idx, files, container, scene) {
    var volLoader = new AMI.VolumeLoader(container);
    return (
        Promise.resolve()
        // load the file
        .then(function () {
            return new Promise(function (resolve, reject) {
                let myReader = new FileReader();
                // should handle errors too...
                myReader.addEventListener('load', function (e) {
                    resolve(e.target.result);
                });
                myReader.readAsArrayBuffer(files[idx]);
            });
        })
        .then(function (buffer) {
            //return fsmLoader.parse({ url: files[idx].name, buffer });
            return volLoader.parse({
                url: files[idx].name,
                buffer
            });
        })
        .then(function (brainVol) {
            console.log(brainVol);
            var stack1 = brainVol._stack[0];
            //stack1.prepare();
            var sHelper = new AMI.StackHelper(stack1);
            // red = 0xff0000,
            //scene.add(brainVol);
            sHelper.border.color = 0xff0000;
            sHelper.bbox.visible = false;
            sHelper.orientation = 0;
            //debugger;
            //var sHelper2 = sHelper; sHelper2.orientation = 1;
            //sHelper2.name = 'Shelper2';
            //sHelper.name = 'Shelper';
            //var sHelper3 = sHelper; sHelper3.orientation = 2;
            scene.add(sHelper);
            //scene.add(sHelper2);
            //scene.add(sHelper3);
        })
        .catch(function (error) {
            window.console.log('oops... something went wrong...');
            window.console.log(error);
        })
    );
}

/**
 * parse electrode JSON file
 */
function parseElecJson(idx, files, table) {
    return (
        Promise.resolve()
        .then(function () {
            return new Promise(function (resolve, reject) {
                let myReader = new FileReader();
                // should handle errors too...
                myReader.addEventListener('load', function (e) {
                    resolve(e.target.result);
                });
                myReader.readAsText(files[idx]);
            });
        })
        .then(function (rawText) {
            //debugger;
            let parsedText = JSON.parse(rawText);
            
            // Check if some necessary properties are there 
            // If the electrode doesn't have a default color, then 

            parsedText.forEach(function (elecObj) {
                
                
                if (!elecObj.hasOwnProperty('color')) {
                    elecObj.color = 'rgb(255,0,0)';
                }

                if (!elecObj.hasOwnProperty('motor')) {
                    elecObj.motor = false;
                }

                if (!elecObj.hasOwnProperty('sensory')) {
                    elecObj.sensory = false;
                }

                if (!elecObj.hasOwnProperty('visual')) {
                    elecObj.visual = false;
                }

                if (!elecObj.hasOwnProperty('auditory')) {
                    elecObj.auditory = false;
                }

                if (!elecObj.hasOwnProperty('language')) {
                    elecObj.language = false;
                }


            })

            return parsedText;
        })
        .then(function (elecData) {
            //debugger;
            elecTable.setData(elecData)
            .then(function(){
                document.getElementById("selectElecs").classList.remove("w3-disabled");
                document.getElementById("toggleEditTable").classList.remove("w3-disabled");
                document.getElementById("clearElecsBttn").classList.remove("w3-disabled");
                document.getElementById("toggleEditTableCheck").disabled = false;
                
                // Checkbox to enable editing of elecTable
                editableColumns = ['soz','spikey','motor','sensory','visual','auditory','language'];
                let editColButton = document.getElementById("toggleEditTable").children[0];
                editColButton.addEventListener('click', function(event){
                    editableColumns.forEach(function(col){
                        elecTable.updateColumnDefinition(col, {editable: editColButton.checked})
                    })
                });

            })
            .catch(function(error){
                window.console.log('oops... something went wrong when loading elecTable');
                window.console.log(error);
            });
        })
        .catch(function (error) {
            window.console.log('oops... something went wrong...');
            window.console.log(error);
        })
    );
}

function addText2Scene(text,txtParent) {
    let geom = new THREE.TextBufferGeometry(text,{
        font: font,
        size: 1.5,
        height: 0.1
    });
    let mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(txtParent.material.color.getStyle())
    });
    let textMesh = new THREE.Mesh(geom, mat);
    textMesh.visible = threeTextObjs.Show;
    txtParent.add(textMesh);
    textMesh.position.z = 2; // Make sure the text doesn't overlap the electrode
    threeTextObjs.push(textMesh.id);
}

function plusDivs(chng) {
    // First, index all of the ElecSlice elements
    //debugger;
    let eSlices = document.getElementsByClassName("ElecSlice");
    slideIndex += chng;
    if (slideIndex > eSlices.length) {slideIndex = 1}
    if (slideIndex < 1) {slideIndex = eSlices.length}
    for (let i = 0; i < eSlices.length; i++) {
        eSlices[i].style.display = "none";  
      }
      eSlices[slideIndex-1].style.display = "block";  

}

