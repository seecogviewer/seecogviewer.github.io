var scene, electable, aes, imgHolder, vol, sc, init3;

init3 = false;

vol = {
    'Coronal': null,
    'Sagittal': null,
    'Axial': null
    /*'foci': {
        'id': [],
        'x': [],
        'y': [],
        'z': []
    }*/
};

sc = {
    elecTable: {
        obj: null,
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
        Axial: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        },
        Sagittal: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        },
        Coronal: {
            scene: null,
            camera: null,
            renderer: null,
            orientation: "3D",
            domID: null,
            controls: null,
            color: null,
            on: false
        },
        elecScene: null
    },
    datGui: {
        objs: {
            'parent': [],
            'surf': [],
            'vol': [],
            'elecs': []
        },
        domID: 'sceneGui'
    },
    elecSetting: {
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
    font: [],
    dtypes: {
        'FSmesh': {
            'filename': [],
            'filedata': [],
            'extensions': ['pial', 'inflated', 'srf', 'thalamus', 'caudate', 'putamen', 'pallidum', 'hippocampus', 'amygdala', 'white']
        },
        'STL': {
            'filename': [],
            'filedata': [],
            'extensions': ['stl']
        },
        'GLTF': {
            'filename': [],
            'filedata': [],
            'extensions': ['gltf', 'glb']
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