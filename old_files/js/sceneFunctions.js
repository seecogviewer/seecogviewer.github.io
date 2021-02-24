// Functions for adding stuff to three.js scene

// Add text to a 3Js scene
function addText2Scene(text,txtParent) {
    let geom = new THREE.TextBufferGeometry(text,{
        font: sc.font,
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

// Add an electrode
function addElec2Scene (elecTableRow) {

    const elecRow = elecTableRow.getData();

    // Use on each Aesthetic property to determine how to show it
    function determineAes(data,property) {
        let nonChosen = true;
        let aesOptions = Object.keys(sc.elecSetting.aes[property]);
        const nOptions = aesOptions.length;
        for (ii = 0; nonChosen; ii++) {
            let optN = aesOptions[ii];
            if (data[optN]==true || data[optN]==1) {
                const aesSpec = sc.elecSetting.aes[property][optN];
                nonChosen = false;
            }
            if (ii === nOptions-1) {
                const aesSpec = sc.elecSetting.aes.default[property];
                nonChosen = false;
            }
        }
        return aesSpec;
    }

    // First determine shape
    let shapeTmp = determineAes(elecRow,'shape');
    let shape = new shapeTmp;

    // Color
    let eColor = determineAes(elecRow,'color');

    // Scale/size
    let size = determineAes(elecRow,'size');

    // Add the electrode into the scene
    const coords = elecRow.lepto;
    const material = new THREE.MeshLambertMaterial({color: eColor});
    const elecMesh = new THREE.Mesh(shape, material);
    elecMesh.scale.x = size;
    elecMesh.scale.y = size;
    elecMesh.scale.z = size;
    elecMesh.position.x = coords[0];
    elecMesh.position.y = coords[1];
    elecMesh.position.z = coords[2];
    elecMesh.name = elecRow.elecid;
    const RASToLPS = new THREE.Matrix4();
    sc.scenes.threeD.scene.add(elecMesh);
    addText2Scene(elecMesh.name, elecMesh);

}

// Add static image to image pane
addStaticImage(picsData) {

    let imgPaneNow = sc.viewModes[currentViewMode]['imgPane'];

    if (picsData !== 'NaN') {
        let newImage = document.createElement("IMG");
        newImage.src = picsData;
        newImage.className = 'ElecSlice';
        newImage.classList.add('w3-display-center');
        document.getElementById(imgPaneNow).appendChild(newImage);
        //document.getElementById("elecSlideshow").appendChild(newImage);

        // Check if need to toggle the slide buttons being disabled
        if (document.getElementsByClassName('slidebttn')[0].classList.contains('w3-disabled')) {
            document.getElementsByClassName('slidebttn')[0].classList.remove("w3-disabled");
            document.getElementsByClassName('slidebttn')[1].classList.remove("w3-disabled");
            document.getElementsByClassName('slidebttn')[0].disabled = false;
            document.getElementsByClassName('slidebttn')[1].disabled = false;
            let eSlices = document.getElementsByClassName("ElecSlice");
            eSlices[0].style.display = 'block';
            slideIndex = 1;
        }

        // Embedded function. If shift + left-click pressed, image dissappears
        newImage.onclick = function (event) {
            if (event.shiftKey) {
                newImage.remove()

                // Do we need to disable the buttons for slideshow?
                if (currentViewMode == 'defaultView') {
                    //if (document.getElementsByClassName("ElecSlice").length === 0) {
                    if (document.getElementById(imgPaneNow).childNodes.length === 0) {
                        document.getElementsByClassName('slidebttn')[0].classList.add("w3-disabled");
                        document.getElementsByClassName('slidebttn')[1].classList.add("w3-disabled");
                        document.getElementsByClassName('slidebttn')[0].disabled = true;
                        document.getElementsByClassName('slidebttn')[1].disabled = true;
                    } else {
                        plusDivs(-1);
                    }
                }
            }
        }
    }
}