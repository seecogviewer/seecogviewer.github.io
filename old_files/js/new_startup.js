// Object with everything
var sc = {
    elecTable: {
        obj: [],
        domID: "elecTableChild"
    },
    scenes: {
        threeD: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: "threeDviewArea",
            controls: null,
            color: null,
            on: false
        },
        axial: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        },
        saggital: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        },
        coronal: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        }
    },
    datGui: {
        obj: [],
        domID: 'sceneGui'
    },
    elecSetting: {
        aes: {
            shape: {
                soz: new THREE.TetrahedronBufferGeometry(2, 0),
                spikey: new THREE.BoxBufferGeometry(2, 0),
            },
            color: {
                motor: '#186aed',
                sensory: '#148c34',
                visual: '#cfaf23',
                auditory: '#a616a8',
                language: '#d5e800',
            },
            size: {
                soz: 1.5,
                spikey: 1.5,
            },
            default: {shape: THREE.SphereBufferGeometry(1, 32, 32), size: 1, color: '#ff0008'}
        },
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
    },
    surfColors: {
        amygdala: '#e09f9f', // pink/beige
        hippocampus: '#0a3c7d', // navy blue
        pallidum: '#5e4b45', // brown
        caudate: '#edf779', // yellow
        putamen: '#b0f0a1', // mint
        thalamus: '#ff66b5', // hot pink
        pial: '#787878', // Gray
        inflated: '#787878', // Gray
        white: '#787878' // Gray
    },
    data: [],
    viewModes: {
        current: 'default',
        options: ['default','threeCol'],
    },
    font: new THREE.FontLoader().parse(rawText),
    dtypes: {
        'FSmesh': {
            'filename': [],
            'filedata': [],
            'extensions': ['pial', 'inflated','srf','thalamus','caudate','putamen','pallidum','hippocampus','amygdala','white']
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
        },
        'overlay': {
            'filename': [],
            'filedata': [],
            'extensions': ['overlay']
        }
    },
};

// staticImg object to be shown in static image panes
class staticImg extends HTMLImageElement {
    constructor() {
        super();
        this.className = 'staticImg';
        this.onclick = function(event) {
            if (event.shiftKey) {
                this.remove();
            }
        }
    }
}


// Startup
threeD = document.getElementById(sc.scenes.domID);

//#region Classic ThreeJS setup
// ThreeJS renderer
sc.scenes.threeD.renderer = new THREE.WebGLRenderer({
    antialias: true
});
sc.scenes.threeD.renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
sc.scenes.threeD.renderer.setClearColor(0xffffff, 1);
sc.scenes.threeD.renderer.setPixelRatio(window.devicePixelRatio);
threeD.appendChild(sc.scenes.threeD.renderer.domElement);

// ThreeJS scene
sc.scenes.threeD.scene = new THREE.Scene();

// ThreeJS camera
//const camera = new THREE.PerspectiveCamera(45, threeD.clientWidth / threeD.clientHeight, 1, 1000);
sc.scenes.threeD.camera = new THREE.PerspectiveCamera(45, threeD.clientWidth / threeD.clientHeight, 1, 1000);
sc.scenes.threeD.camera.position.x = 250;
sc.scenes.threeD.camera.position.y = 250;
sc.scenes.threeD.camera.position.z = 250;
//#endregion

// Lighting for the scene
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.copy(sc.scenes.threeD.camera.position);
sc.scenes.threeD.scene.add(light);

// AMI style trackball
sc.scenes.threeD.controls = new AMI.TrackballControl(camera, renderer.domElement);

// Change variable to indicate the viewer is switched on
sc.scenes.threeD.on = true;

// Initiate dat.gui controller
sc.datGui.obj = new dat.GUI({
    autoPlace: true,
    width: 200,
    resizable: false
});
dgParent = document.getElementById(sc.datGui.domID);
dfParent.appendChild(sc.datGui.obj.domElement);


//#region Display Electrode
// Variables needed: Coordinates, Size, Text, Color, Shape



//#endregion



//#region Defaults on how to display electrodes

