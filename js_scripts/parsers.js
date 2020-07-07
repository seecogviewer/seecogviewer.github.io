/**
 * parse Freesurfer Mesh files
 */
function parseFSMesh(idx, files,container,scene) {
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
            let currentColor = {color: '#787878'};
            const material = new THREE.MeshLambertMaterial({
                color: currentColor.color,//'rgb(120,120,120)',
                transparent: true
            });
            brainVol.computeVertexNormals();
            let mesh = new THREE.Mesh(brainVol, material);
            mesh.name = files[idx].name;
            //debugger;
            meshFolder = sceneGui.addFolder(files[idx].name);
            meshFolder.add(material, 'opacity', 0, 1).name('Opacity'); // Add folder to viewerGui for this mesh
            var colorchanger = meshFolder.addColor(currentColor, 'color').name("color");
            //debugger;
            colorchanger.onChange( function(colorVal) 
            {
                let newColor = colorVal.replace('#','0x');
                material.color.setHex(newColor);
            });
            meshFolder.open();
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
function parseVolume(idx, files,container,scene) {
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
                return volLoader.parse({ url: files[idx].name, buffer });
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
function parseElecJson(idx,files,table) {
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
        .then(function(rawText) {
            //debugger;
            let parsedText = JSON.parse(rawText);
            parsedText.forEach(function(elecObj) {
                if (!elecObj.hasOwnProperty('color')) {
                    elecObj.color = 'rgb(255,0,0)';
                }
            })

            return parsedText;
        })
        .then(function(elecData) {
            //debugger;
            elecTable.setData(elecData);
        })
        .catch(function(error){
            window.console.log('oops... something went wrong...');
            window.console.log(error);
        })
    );
}


/*function pic_data_extract(elecObj,parentArray) {
    let picObj = {
        "subid": elecObj.subid,
        "elecid": elecObj.elecid,
        "pic_data": elecObj.PICS
    };

    picDataArray.push(picObj);

}*/

/**
 * parse STL files
 */
function parseSTL(idx, files,container,scene) {
    let stlLoader = new THREE.STLLoader(container);
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
                //myReader.readAsBinaryString(files[idx]);
            });
        })
        .then(function (buffer) {
            debugger;
            return stlLoader.parse({text: buffer});
        })
        .then(function (brainVol) {
            let currentColor = {color: '#787878'};
            const material = new THREE.MeshLambertMaterial({
                color: currentColor.color,//'rgb(120,120,120)',
                transparent: true
            });
            brainVol.computeVertexNormals();
            let mesh = new THREE.Mesh(brainVol, material);
            mesh.name = files[idx].name;
            //debugger;
            meshFolder = sceneGui.addFolder(files[idx].name);
            meshFolder.add(material, 'opacity', 0, 1).name('Opacity'); // Add folder to viewerGui for this mesh
            var colorchanger = meshFolder.addColor(currentColor, 'color').name("color");
            //debugger;
            colorchanger.onChange( function(colorVal) 
            {
                let newColor = colorVal.replace('#','0x');
                material.color.setHex(newColor);
            });
            meshFolder.open();
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