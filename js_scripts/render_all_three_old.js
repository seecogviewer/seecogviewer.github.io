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

    //var viewer3d = null;
    var brains = [];
    var dtypes = {
        'mesh': {
            'filename': [],
            'filedata': [],
            'extensions': ['pial', 'inflated']
        },
        'electrodes': {
            'filename': [],
            'filedata': [],
            'extensions': ['json']
        },
        'volumes': {
            'filename': [],
            'filedata': [],
            'extensions': ['nii','nii.gz','mgz','mgh','gz']
        }
    };



    let files2Open = [];

    // Create a new tabulator style table
    var table = new Tabulator("#elecMenu", {
        //data: elecJson,
        placeholder: "Waiting for electrode json file",
        //layout:"fitColumns",
        layout: "fitColumns",
        //dataTree: true, // Data tree view allowing dropdowns and children elements
        //movableRows:true, // Can drag rows
        selectable: true,
        groupBy: ["subid", "gridid"],
        groupStartOpen: [true, true],
        /*rowClick: function (e, row) {
            if (row.isSelected()) {
                //debugger;
                const coords = row.getData().lepto;
                const elecShpere = new THREE.SphereBufferGeometry(4, 32, 32);
                const material = new THREE.MeshLambertMaterial({ color: row.getData().color }); //color: 0xffff00
                const sphere = new THREE.Mesh(elecShpere, material);
                sphere.position.x = coords[0];
                sphere.position.y = coords[1];
                sphere.position.z = coords[2];
                sphere.name = row.getData().elecid;
                scene.add(sphere);
            } else {
                scene.remove(scene.getObjectByName(row.getData().elecid));
            }
        },*/
        columns: [
            {
                title: "General",
                columns: [ // The 2 below previously had aditional param froze: true
                    { title: "SubID", field: "subid", visible: true, headerFilter: "input" },
                    { title: "elecID", field: "elecid", visible: true, headerFilter: "input" },
                ]
            },
            {
                title: "Semiology",
                columns: [
                    {
                        title: "SOZ", field: "soz", formatter: "tickCross",
                        editor: "select", editorParams: { values: { true: true, false: false } },
                        headerFilter: true, headerFilterParams: { values: { true: true, false: false } }
                    },
                    {
                        title: "SPIKEY", field: "spikey", formatter: "tickCross",
                        editor: "select", editorParams: { values: { true: true, false: false } },
                        headerFilter: true, headerFilterParams: { values: { true: true, false: false } }
                    }
                ]
            },
            { title: "Anat", field: "anat", headerFilter: "input" }
        ],
    });

    //#region Change Colors of Electrodes

    // Change colors of electrodes after choosing color
    function changeElecColors(table,color) {
        // Get the selected rows of the table
        let selectedRows = table.getSelectedRows(); //get array of currently selected row components.
        selectedRows.forEach(function(rowN) {
            rowN.update({'color': color})
            .then(function() {
                scene.getObjectByName(rowN.getData().elecid).material.color = new THREE.Color(rowN.getData().color);
            })
            .catch(function(error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        })
    }

    // Create specturm color picker
    $('#color-picker').spectrum({
        /*type: "flat",
        hideAfterPaletteSelect: "true",
        showInput: "true",
        showInitial: "true",
        allowEmpty: "false",*/
        type: "component",
        showPalette: "false",
        showInput: "true",
        showInitial: "true",
        allowEmpty: "false",
        change: function(color) {
            //debugger;
            changeElecColors(table,color.toRgbString());
        }
    });

    //#endregion

    $("#elecs-plot").click( function( event ) {
        event.preventDefault();
        let selectedRows = table.getSelectedRows();
        selectedRows.forEach(function(row) {
            const coords = row.getData().lepto;
            const elecShpere = new THREE.SphereBufferGeometry(2, 32, 32);
            const material = new THREE.MeshLambertMaterial({ color: row.getData().color }); //color: 0xffff00
            const sphere = new THREE.Mesh(elecShpere, material);
            sphere.position.x = coords[0];
            sphere.position.y = coords[1];
            sphere.position.z = coords[2];
            debugger;
            sphere.name = row.getData().elecid;

            const RASToLPS = new THREE.Matrix4();
            /*RASToLPS.set(
                -1, 0, 0, coords[0], 
                0, -1, 0, coords[1], 
                0, 0, 1, coords[2], 
                0, 0, 0, 1);*/
            //RASToLPS.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, coords[0], coords[1], coords[2], 1);
            /*RASToLPS.set(
                -1, 0, 0, 0, 
                0, -1, 0, 0, 
                0, 0, 1, 0, 
                0, 0, 0, 1);
            sphere.applyMatrix(RASToLPS);*/

            scene.add(sphere);
        })
        //debugger;
      });

    // Add listener to fileinput button so that electrode json file and meshes will be parsed
    datainput.addEventListener('change', function (e) {

        // Bin the input files based on file extension
        for (i = 0; i < e.target.files.length; i++) {

            // Get basic params of this file
            var _fname = e.target.files[i].name;
            var _fext = _fname.split('.').pop().toLowerCase();
            debugger;

            var reader = new FileReader();

            // Decide what kind of file it is and how to load it
            if (dtypes['mesh']['extensions'].indexOf(_fext) >= 0) {
                //files2Open.push(parseFSMesh(i, e.target.files));
                //files2Open.push(parseFSMesh(i, e.target.files,elem,scene,meshFolder));
                parseFSMesh(i, e.target.files,elem,scene,meshFolder);
            } else if (dtypes['electrodes']['extensions'].indexOf(_fext) >= 0) {
                parseElecJson(i, e.target.files,table); //parse as electrodes json file
            } else if (dtypes['volumes']['extensions'].indexOf(_fext) >= 0) {
                parseVolume(i, e.target.files,elem,scene,meshFolder);
            } else {
                alert('Unknown file type!');
            }
        }

    })

})