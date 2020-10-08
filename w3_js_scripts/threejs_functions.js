// Functions for ThreeJs


// Add electrode to a 3Js scene





// Add text to a 3Js scene
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



// Add image to display
/*let newImage = document.createElement("IMG");
newImage.src = picsData;
newImage.className = 'ElecSlice';
newImage.classList.add('w3-display-center');
document.getElementById("elecSlideshow").appendChild(newImage);
*/