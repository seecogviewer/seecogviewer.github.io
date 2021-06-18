var parsers = {};

$(document).ready(function () {
    //#region Parsing functions

    // Parse electrodes json file
    parsers.ElecJson = function(idx, files, table) {
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
                    elecTable.setupElecRow(elecObj);
                })
                return parsedText;
            })
            .then(function (elecData) {
                elecTable.createElecTable(elecData);
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse electrodes csv file
    parsers.ElecCsv = function(idx, files, table) {
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
                
                // Convert the csv file to a json formatted style
                const parsedData = rawText.split("\n");
                let colNames = parsedData[0].split(",");

                // Remove any blank columns
                let rmvCols = true;
                while (rmvCols) {
                    if (colNames[colNames.length-1] === "") {
                        colNames.pop();
                    } else {
                        rmvCols = false;
                    }
                }

                // Remove any trailing whitespaces from column names and set to lowercase
                for (c=0; c<colNames.length; c++) {
                    colNames[c] = colNames[c].toLocaleLowerCase().trim();
                }

                let numCols = colNames.length;
                let tableData = [];

                // Go through each row
                //let random_subid = Math.random().toString(36).substring(7).toUpperCase();
                let random_subid = 'sub001';
                const tLength = parsedData.length;
                for (ii=1;ii<tLength;ii++) {
                    if (parsedData[ii].length == 0) {continue;}
                    let rowData = {};
                    let rawRow = parsedData[ii].split(",");

                    // Add a new field for each column
                    for (cii=0;cii<numCols;cii++) {
                        rowData[colNames[cii]] = rawRow[cii];
                    }

                    // Include subject ID
                    if ( !rowData.hasOwnProperty('subid') ) {
                        rowData['subid'] = random_subid;
                    }

                    // Add gridid
                    let elecid = rowData['elecid'];
                    rowData['gridid'] = elecid.replace(/\d+/,"");

                    // Create the "full name"
                    rowData['fullname'] = rowData['subid'] + '-' + rowData['elecid'];

                    // Add coords
                    rowData["coords"] = [].concat(
                        parseFloat(rowData['x']),
                        parseFloat(rowData['y']),
                        parseFloat(rowData['z'])
                        );

                    tableData.push(elecTable.setupElecRow(rowData));

                }

                return tableData;
            })
            .then(function (elecData) {
                elecTable.createElecTable(elecData);
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse freesurfer meshes
    parsers.FSMesh = function(idx, files) {
        const threeD = document.getElementById("threeDviewArea");
        let fsmLoader = new THREE.FreeSurferLoader(threeD);
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
                const material = new THREE.MeshLambertMaterial({
                    color: sc.surfColors[surfExt],
                    transparent: true,
                    depthTest: true,
                    depthWrite: true,
                    side: THREE.FrontSide
                });
                //material.side = THREE.FrontSide;
                brainVol.computeVertexNormals();
                let mesh = new THREE.Mesh(brainVol, material);
                mesh.name = files[idx].name;

                // Choose rendering order
                if (surfExt == 'pial') {
                    mesh.renderOrder = 10;
                } else if (surfExt == 'white') {
                    mesh.renderOrder = 7;
                } else {
                    mesh.renderOrder = 5;
                    //mesh.material.depthWrite = false;
                }

                // Add to scene
                scene.add(mesh);
                //debugger;

                // Store the types of skins and their controllers this mesh has
                mesh.userData['overlays'] = {
                    default: {
                        data: "NA",
                        type: "default",
                        //material: material,
                        //controller: controller
                    }
                };
                meshGui = scenery.addGui4Surf(mesh);
                mesh.userData['gui'] = meshGui;

                scenery.updateMeshOverlay(mesh,'default');

            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse overlays for meshes
    parsers.Overlay = function(idx, files) {
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
                let overlay = JSON.parse(rawText);

                // Grab the object its' meant for
                let mesh = sc.scenes.threeD.scene.getObjectByName(overlay['mesh']);
                
                let overlayname;
                if (overlay.hasOwnProperty('name')) {
                    overlayname = overlay.name;
                } else {
                    overlayname = files[idx].name.split('.')[0];
                }
                
                // Add this as an optional overlay for the mesh
                mesh.userData['overlays'][overlayname] = {
                    data: overlay['data'],
                    type: overlay['type']
                };

                // Non-mandatory but possible options within the import
                let otherkeys = ['labels','ctable'];
                for (k of otherkeys) {
                    if (overlay.hasOwnProperty(k)) {
                        mesh.userData['overlays'][overlayname][k] = overlay[k];
                    }
                }

                return {'mesh': mesh, 'name': overlayname};
            })
            .then(function(d) {
                let mesh = d.mesh;
                let overlayname = d.name;
                let meshGui = mesh.userData.gui;
                /*
                let skinTypes = Object.keys( mesh.userData['overlays'] );
                //debugger;
                let skinObj = {
                    'overlay': overlayname
                };
                meshGui.__controllers[2].remove();
                meshGui.add(skinObj,'overlay',skinTypes).name('Overlays');
                */
                scenery.updateMeshOverlay(mesh,overlayname,importing=true);
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse Volumes
    parsers.Volume = function(idx, files) {
        var volLoader = new AMI.VolumeLoader();
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
                return volLoader.parse({
                    url: files[idx].name,
                    buffer
                });
            })
            .then(function (brainVol) {
                var stackT1 = brainVol.stack[0];
                stackT1.prepare();
                brainVol = stackT1;
                var RASToLPS = new THREE.Matrix4();
                var worldCenter = stackT1.worldCenter();
                RASToLPS.set(
                    -1, 0, 0, worldCenter.x,
                    0, -1, 0, worldCenter.y,
                    0, 0, 1, worldCenter.z,
                    0, 0, 0, 1);
                var lps2ras = new THREE.Matrix4().getInverse(RASToLPS);
                stackT1.regMatrix = lps2ras;
                stackT1.computeIJK2LPS();

                var sHelper = new AMI.StackHelper(stackT1);
                sHelper.bbox.color = 0xff0000;
                sHelper.border.color = 0x00ff00;
                sHelper.children[0].visible = false;
                sHelper.orientation = 0;
                //let volFolder = sc.datGui.objs.parent.addFolder('Volume');
                //sc.datGui.objs.vol = volFolder;
                const orients = {
                    'Coronal': {
                        'ori': 0,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0xff0000,
                        'axes': ['x', 'y'],
                        'pos': 'z',
                        'dom': "plane-coronal",
                        'scene': null
                    },
                    'Sagittal': {
                        'ori': 1,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x00ff00,
                        'axes': ['y', 'z'],
                        'pos': 'x',
                        'dom': "plane-sagittal",
                        'scene': null
                    },
                    'Axial': {
                        'ori': 2,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x0000ff,
                        'axes': ['x', 'z'],
                        'pos': 'y',
                        'dom': "plane-axial",
                        'scene': null
                    }
                };
                for (plane in orients) {
                    vol[`${plane}`] = orients[plane]['obj'];
                    orients[plane]['obj'].name = files[idx].name; //plane;
                    orients[plane]['obj'].border.color = orients[plane]['color'];
                    orients[plane]['obj'].children[0].visible = false;
                    orients[plane]['obj'].orientation = orients[plane]['ori'];
                    
                    //let newScene = new THREE.Scene(); newScene.add(orients[plane]['obj']);
                    //scenePlaneController(newScene,plane,orients[plane]['axes'],orients[plane]['pos']);
                    //sc.scenes.threeD.scene.add(newScene);

                    // Create 2D plane scene
                    //createPlaneScene(newScene,plane,orients[plane]['dom']);
                    
                    scenery.planeController(orients[plane]['obj'], plane, orients[plane]['axes']);
                    scenery.create2DScene(orients[plane],plane);
                    sc.scenes.threeD.scene.add(sc.scenes[plane].scene);
                    //sc.scenes.threeD.scene.add(orients[plane]['obj']);
                }
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }
    //#endregion
});