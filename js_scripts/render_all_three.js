let elem, scene, elecinput, datainput, meshFolder;

// Initiate the viewer
function init() {
    elecinput = document.getElementById('elecinput');
    datainput = document.getElementById('fileinput');
    elem = document.getElementById('viewer');

    //#region Classic ThreeJS setup
    // ThreeJS renderer
    var renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(elem.offsetWidth, elem.offsetHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    elem.appendChild(renderer.domElement);

    // ThreeJS scene
    scene = new THREE.Scene();

    // ThreeJS camera
    const camera = new THREE.PerspectiveCamera(45, elem.clientWidth / elem.clientHeight, 0.1, 1000);
    camera.position.x = 250;
    camera.position.y = 250;
    camera.position.z = 250;
    debugger;

    // AMI style trackball
    const controls = new AMI.TrackballControl(camera, elem);

    // Change size appropriately on window resize
    /*const onWindowResize = (elem) => {
        camera.aspect = elem.clientWidth / elem.clientHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(elem.clientWidth, elem.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);*/
    //#endregion

    let light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x222222));

    // Add dat.GUI tab for viewer
    meshFolder = viewerGui.addFolder('Mesh Opacity');
    meshFolder.open();


    //#region Animation and render everything
    const animate = () => {
        controls.update();
        light.position.copy(camera.position);
        renderer.render(scene, camera);
        
        requestAnimationFrame(function () {
            animate();
        });
    }
    animate();
    //#endRegion
}


$(document).ready(function () {

    init();

})