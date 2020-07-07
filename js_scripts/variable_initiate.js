// Tabulator Table
var elecTable, threeD, renderer, scene, picDataArray, sceneGui;

// Variable to hold info and different types of files and how to handle them
var dtypes = {
    'FSmesh': {
        'filename': [],
        'filedata': [],
        'extensions': ['pial', 'inflated','lab']
    },
    'STL': {
        'filename': [],
        'filedata': [],
        'extensions': ['stl']
    },
    'electrodes': {
        'filename': [],
        'filedata': [],
        'extensions': ['json']
    },
    'volumes': {
        'filename': [],
        'filedata': [],
        'extensions': ['nii', 'nii.gz', 'mgz', 'mgh', 'gz']
    }
};

// dat.gui variable


// THREE.JS helper variable
var viewer_3d = {
    scene: null,
    camera: null,
    renderer: null,
    orientation: "3D",
    domID: null,
    controls: null,
    color: null,
    on: false
};

// Set colors and shapes for each type of electrode
var elecSettings = {
    semiology: {
        soz_spikey: 'box',
        soz: 'tetrahedron',
        spikey: 'cylinder',
        none: 'sphere'
    },
    functional: {
        motor: '#186aed',
        sensory: '#148c34',
        visual: '#cfaf23',
        auditory: '#a616a8',
        language: '#d5e800',
        none: '#ff0008'
    }
};


function viewer_3d_init() {

    threeD = document.getElementById("threeDviewArea");

    //#region Classic ThreeJS setup
    // ThreeJS renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
    renderer.setClearColor(0xffffff, 1);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeD.appendChild(renderer.domElement);

    // ThreeJS scene
    scene = new THREE.Scene();

    // ThreeJS camera
    const camera = new THREE.PerspectiveCamera(45, threeD.clientWidth / threeD.clientHeight, 0.1, 1000);
    camera.position.x = 250;
    camera.position.y = 250;
    camera.position.z = 250;
    //#endregion

    // Lighting for the scene
    let light = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x222222));

    // AMI style trackball
    //const controls = new AMI.TrackballControl(camera, threeD);
    const controls = new AMI.TrackballControl(camera, renderer.domElement);

    // Change variable to indicate the viewer is switched on
    viewer_3d.on = true;

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

    let sceneGuiParent = document.getElementById('sceneGui');
    sceneGui = new dat.GUI({ 
        autoPlace: true,
        width: 200,
        resizable: false
     });
    sceneGuiParent.appendChild(sceneGui.domElement);

}