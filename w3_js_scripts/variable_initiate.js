// Tabulator Table
var elecTable, threeD, renderer, scene, picDataArray, sceneGui, font, surfFolder;
var threeTextObjs = [];
threeTextObjs.Text = true;
threeTextObjs.Legend = true;
var slideIndex = 0;

// Variable to hold info and different types of files and how to handle them
var dtypes = {
    'FSmesh': {
        'filename': [],
        'filedata': [],
        'extensions': ['pial', 'inflated','srf','thalamus','caudate','putamen','pallidum','hippocampus','amygdala']
    },
    'STL': {
        'filename': [],
        'filedata': [],
        'extensions': ['stl']
    },
    'GLTF': {
        'filename': [],
        'filedata': [],
        'extensions': ['gltf','glb']
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
    ictal: {
        soz_spikey: new THREE.BoxBufferGeometry(2, 2, 2),
        soz: new THREE.TetrahedronBufferGeometry(2, 0),
        spikey: new THREE.DodecahedronBufferGeometry(2, 0),
        none: new THREE.SphereBufferGeometry(1, 32, 32)
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

// Set colors for each kind of surface that will be loaded
var surfColors = {
    amygdala: '#e09f9f', // pink/beige
    hippocampus: '#0a3c7d', // navy blue
    pallidum: '#5e4b45', // brown
    caudate: '#edf779', // yellow
    putamen: '#b0f0a1', // mint
    thalamus: '#ff66b5', // hot pink
    pial: '#787878', // Gray
    inflated: '#787878' // Gray
}

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
    light.position.copy(camera.position);
    //scene.add(light);
    //scene.add(new THREE.AmbientLight(0x222222));
    //let light = new THREE.AmbientLight(0xffffff);
    scene.add(light);

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

        // If there's text in the scene, then make sure it looks at the camera
        if (threeTextObjs.length >= 1) {
            threeTextObjs.forEach(function (textId) {
                const textInScene = scene.getObjectById(textId);
                textInScene.lookAt(camera.position.x,camera.position.y,camera.position.z);
                textInScene.rotation.setFromRotationMatrix(camera.matrix);
            })
        }
    }
    animate();
    //#endRegion

    // The font to be used in THREE.js scenes
    font = new THREE.FontLoader().parse(rawText);

    // GUI that controls mesh opacity and displaying of text in scene
    let sceneGuiParent = document.getElementById('sceneGui');
    sceneGui = new dat.GUI({
        autoPlace: true,
        width: 200,
        resizable: false
     });
    sceneGuiParent.appendChild(sceneGui.domElement);

    // Add the electrode legend
    let lgndImg = document.createElement("IMG");
    lgndImg.src = elecLegendImg;
    lgndImg.id = "elecLegend";
    lgndImg.style.display = "block";
    document.getElementById("elecLegend").appendChild(lgndImg);


    // Create child folder to toggle electrode text and legend being shown
    let textFolder = sceneGui.addFolder('Electrode Options');
    let textViewToggle = textFolder.add(threeTextObjs,'Text');
    textViewToggle.onChange(function (toggle) {
        threeTextObjs.forEach(function (textId) {
            const textInScene = scene.getObjectById(textId);
            textInScene.visible = toggle;
        })
    });
    let legendViewToggle = textFolder.add(threeTextObjs,'Legend');
    legendViewToggle.onChange(function (toggle) {
        if (toggle==true) {
            lgndImg.style.display = "block";
        } else {
            lgndImg.style.display = "none";
        }

    });

    // Child folder to store guis for imported surfaces
    surfFolder = sceneGui.addFolder('Surfaces');

}
