/*
To Do
elecTable
- Function to start it
*/

//#region Handling Electrodes
// elecTable Aesthetics Setter
/*var aesDefaults = {
    shape: "sphere",
    color: "black",
    size: 2
};
var aes = {
    default: aesDefaults,
    custom: [
        {
            criteria: [{field: "motor", type: "=",value: true}],
            outcome: {shape: "cube"}
        },
        {
            criteria: [{field: "sensory", type: "=",value: true}],
            outcome: {shape: "dodecahedron"}
        },
        {
            criteria: [{field: "visual", type: "=",value: true}],
            outcome: {shape: "tetrahedron"}
        },
        {
            criteria: [{field: "auditory", type: "=",value: true}],
            outcome: {shape: "cone"}
        },
        {
            criteria: [{field: "language", type: "=",value: true}],
            outcome: {shape: "octahedron"}
        },
        {
            criteria: [{field: "soz", type: "=",value: true}],
            outcome: {color: "red", size: 3}
        },
        {
            criteria: [{field: "spikey", type: "=",value: true}],
            outcome: {color: "green", size: 3}
        },
        {
            criteria: [
                {field: "soz", type: "=",value: false},
                {field: "spikey", type: "=",value: false}
            ],
            outcome: {color: aesDefaults['color'], size: aesDefaults['size']}
        },
        {
            criteria: [
                {field: "motor", type: "=",value: false},
                {field: "sensory", type: "=",value: false},
                {field: "visual", type: "=",value: false},
                {field: "auditory", type: "=",value: false},
                {field: "language", type: "=",value: false}
            ],
            outcome: {shape: aesDefaults['shape']}
        },
    ]
};

// Displaying electrodes

// Shapes guide
var shapeGuide = {
    cube: (h) => new THREE.BoxBufferGeometry(h, h, h),
    sphere: (r) => new THREE.SphereBufferGeometry(r, 32, 32),
    dodecahedron: (r) => new THREE.DodecahedronBufferGeometry(r, 0),
    tetrahedron: (r) => new THREE.TetrahedronBufferGeometry(r, 0),
    cone: (r) => new THREE.ConeBufferGeometry(r, r, 10),
    octahedron: (r) => new THREE.OctahedronBufferGeometry(r,0),
};


var existingElecs = {
    list: [],
    getNames: function() {
        let namesList = [];
        for (o of this.list) {
            namesList.push(o.name);
        }
        return namesList;
    },
    isElec: function(ename) {
        let currentNames = this.getNames();
        return currentNames.indexOf(ename) !== -1;
    },
    add: function(newElec) {
        this.list.push(newElec);
    }
}*/

//#endregion

var vol = {
    'Coronal': null,
    'Saggital': null,
    'Axial': null
};

var sc = {
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
    viewModes: {
        current: 'default',
        options: ['default', 'threeCol'],
    },
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
 var aes, imgHolder;

$(document).ready(function () {

    let init3 = false;
    let scene;

    //#region Aesthetics
    aes = {
        default: {shape: "sphere", color: "black",size: 2}, //aesDefaults,
        elecTextVisible: true,
        custom: [
            {
                criteria: [{field: "motor", type: "=",value: true}],
                outcome: {shape: "cube"}
            },
            {
                criteria: [{field: "sensory", type: "=",value: true}],
                outcome: {shape: "dodecahedron"}
            },
            {
                criteria: [{field: "visual", type: "=",value: true}],
                outcome: {shape: "tetrahedron"}
            },
            {
                criteria: [{field: "auditory", type: "=",value: true}],
                outcome: {shape: "cone"}
            },
            {
                criteria: [{field: "language", type: "=",value: true}],
                outcome: {shape: "octahedron"}
            },
            {
                criteria: [{field: "soz", type: "=",value: true}],
                outcome: {color: "red", size: 3}
            },
            {
                criteria: [{field: "spikey", type: "=",value: true}],
                outcome: {color: "green", size: 3}
            }
        ],
        tmpEditor: [],
        shapeGuide: {
            cube: (h) => new THREE.BoxBufferGeometry(h, h, h),
            sphere: (r) => new THREE.SphereBufferGeometry(r, 32, 32),
            dodecahedron: (r) => new THREE.DodecahedronBufferGeometry(r, 0),
            tetrahedron: (r) => new THREE.TetrahedronBufferGeometry(r, 0),
            cone: (r) => new THREE.ConeBufferGeometry(r, r, 10),
            octahedron: (r) => new THREE.OctahedronBufferGeometry(r,0),
        },
        resetAesthetics: function(selected=false) {
            let rows2Update;
            if (selected === true) {
                rows2Update = sc.elecTable.obj.getSelectedRows();
            } else {
                rows2Update = sc.elecTable.obj.getRows();
            }
            rows2Update.forEach(function(r) {
                r.update({color: 'default', size: 'default', shape: 'default'});
            });
        },
        updateRowValues: function(selected=false) {
            let customAes = this.custom;
            for (a of customAes) {
                let foundRows = sc.elecTable.obj.searchRows(a['criteria']);
                if (foundRows.length !== 0) {
                    foundRows.forEach(function (r) {
                        if (selected === true) {
                            if (r.isSelected()) {r.update(a['outcome']);}
                        } else {
                            r.update(a['outcome']);
                        }
                    })
                }
            }
        },
        updateScObjs: function(selected=false) {
            let rows2Update;
            if (selected === true) {
                rows2Update = sc.elecTable.obj.getSelectedRows();
            } else {
                rows2Update = sc.elecTable.obj.getRows();
            }
            rows2Update.forEach( function(r) {
                r.getData()['scObj'].update();
                /*if (r.getData()['scObj'] !== null) {
                 r.getData()['scObj'].update();
                }*/
            });
        },
        updateAesthetics: function(selected=false) {
            this.resetAesthetics(selected);
            this.updateRowValues(selected);
            this.updateScObjs(selected);
        },
        tmp2Aesthetics: function() {
            let newSettings = this.tmpEditor;

            // First start with default
            let newDefaults = newSettings.getRow('default');
            this.default.shape = newDefaults.getData()['shape'];
            this.default.size = newDefaults.getData()['size'];
            this.default.color = newDefaults.getData()['color'];
            newDefaults.delete();

            // Now update all custom settings
            this.custom = [];
            let tmpTableRows = newSettings.getRows();
            tmpTableRows.forEach( function(r){
                let newCustom = {criteria: [{field: "", type: "=",value: true}], outcome: {}};
                let newOutcome = {};
                newCustom['criteria'][0]['field'] = r.getData()['field'];
                let newShape = r.getData()['shape'];
                let newColor = r.getData()['color'];
                let newSize = r.getData()['size'];
                if (newShape !== "default") {newOutcome['shape'] = newShape}
                if (newColor !== "default") {newOutcome['color'] = newColor}
                if (newSize !== "default") {newOutcome['size'] = newSize}
                newCustom['outcome'] = newOutcome;
                aes.custom.push(newCustom);
            });

            this.updateAesthetics(false);
        },
        createEditorDialog: function() {
            // Dialog for changing elec aesthetics
            let dialogRows = [];
            let defaultSettings = {...aes['default']};
            defaultSettings['field'] = 'default';
            dialogRows.push(defaultSettings);
            const aestheticTraits = ['shape','color','size'];
            let customs = aes['custom'];
            customs.forEach(function(c) {
                let field = c['criteria'][0]['field'];
                let currentSettings = c['outcome'];
                aestheticTraits.forEach(function(a) {
                    if (currentSettings[`${a}`] === undefined) {
                        currentSettings[`${a}`] = "default"
                    }
                });
                currentSettings['field'] = field;
                dialogRows.push(currentSettings);
            });
    
            let dialogColumns = [
                {title: 'Property', field: 'field'},
                {title: 'Shape', field: 'shape', editor: 'select', editorParams: {values: {"default": "default","cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                {title: 'Color', field: 'color', editor: 'select', editorParams: {values: {"default": "default", "red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                {title: 'Size', field: 'size', editor: 'select', editorParams: {values: {"default": "default", "1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3.5, "default": "default"} }}
            ];
    
            let editorTable = new Tabulator('#editorTable', {
                data: dialogRows,
                index: 'field',
                layout:"fitColumns",
                columns: dialogColumns,
                columnMinWidth: 60
            });
            this.tmpEditor = editorTable;
    
            return editorTable;
        },
        validateEditorDialog: function() {
            let defaultRow = this.tmpEditor.getRow('default').getData();
            const shapeIsDefault = defaultRow['shape'] === 'default';
            const colorIsDefault = defaultRow['color'] === 'default';
            const sizeIsDefault = defaultRow['size'] === 'default';
            if (shapeIsDefault || colorIsDefault || sizeIsDefault) {
                return false;
            } else {
                return true;
            }
        }
    };

    
    $("#dialog").dialog({
        resizable: true,
        autoOpen: false,
        width: 700,
        height: 500,
        modal: true,
        buttons: {
            "Update": function() {
                if (!aes.validateEditorDialog) {
                    $("#ui-id-1").text("Can't set a default value to 'default'")
                } else {
                    aes.tmp2Aesthetics();
                    aes.updateAesthetics();
                    $( this ).dialog( "close" );
                }
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        //create: createEditorDialog,
        close: function() {
            //aes['tmpEditor'] = null;
            console.log('Closed!');
        }
    });

    //#endregion


    //#region Buttons to change views
    // Change view to show 3D and static images: All 3 Columns
    $("#chng-view1").click(function () {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height", "70%");
        $("#elecSlideShow").css("height", "30%").show();
        $("#elecStatic").hide();
        $("#scenesArea").css('width', '50%').show();
        $("#threeDviewArea").css("height", "100%").show();
        $("#planarScenes").hide();
    });

    // Change view to show 3D and static images: All 3 Columns
    $("#chng-view2").click(function () {
        $("#planarScenes").hide();
        $("#elecSlideShow").hide();
        $("#elecStatic").css('width', '33.33%').show();
        $("#tableDiv").css('width', '33.33%');
        $("#scenesArea").css('width', '33.33%');
        $("#threeDviewArea").css("height", "100%").show();
        $("#elecTable-parent").css("height", "100%");
    });

    // Change view to table, 3D and 2D planes
    $("#chng-view3").click(function () {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height", "100%");
        $("#elecSlideShow").hide();
        $("#elecStatic").hide();
        $("#scenesArea").css('width', '50%');
        $("#threeDviewArea").css("height", "70%").show();
        $("#planarScenes").css("height", "30%").show();
    });

    // Change view to table and statics
    $("#chng-view4").click(function () {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height", "100%");
        $("#elecSlideShow").hide();
        $("#elecStatic").css('width', '50%').show();
        $("#scenesArea").hide();
    });

    /*var origHeight1 = $("#elecTable-parent").height(),
    origHeight2 = $("#elecSlideShow").height(),
    totalHeight = origHeight1 + origHeight2;
    $("#slideshow-dragbar").draggable({
        axis: 'y',
        containment: [
            $("#tableDiv").offset().left,
            $("#tableDiv").height()/2,
            $("#elecSlideShow").width(),
            $("#elecSlideShow").offset().top*1.1
        ],
        drag: function(event, ui) {
            console.log(ui);
            const newTableHeight = ui.position.top + origHeight1;
            const newSlideShowHeight = ui.position.top + origHeight2;//totalHeight - newTableHeight;
            $("#elecTable-parent").css({"height": newTableHeight});
            $("#elecSlideShow").css({"height": newSlideShowHeight});
        }
    });*/
    //Dialogue to edit properties


    // Dialogue to choose which columns are viewable in the table
    /*$("#dialog").dialog({
        autoOpen: false,
        modal: true,
        open: function() {
            if (sc.elecTable.obj !== null) {
                const tableColumns = sc.elecTable.obj.getColumnDefinitions();
                tableColumns.forEach(function(tc) {
                    let bttnName = tc.title + "-input";
                    let colLabel = document.createElement('LABEL');
                    colLabel.setAttribute('for',bttnName);
                    colLabel.innerText = tc.title;
                    let inptBttn = document.createElement('INPUT');
                    inptBttn.setAttribute('type','checkbox');
                    //inptBttn.setAttribute('checked',tc.visible);
                    inptBttn.checked = tc.visible;
                    inptBttn.id = bttnName;
                    $("#" + bttnName).checkboxradio();
                    $("#dialog-column-list").append(colLabel,inptBttn);
                });
                $("#dialog-column-list").controlgroup({"direction": "vertical"});
                console.log("We're open!");
            } else {
                $("#dialog-column-list").text = "Oh No!";
            }
        },
        //elecTable.getColumnDefinitions()[0].visible
        buttons: {
            "Accept": function() {
                console.log("accepted");
                $("#dialog-column-list > *").remove();
                $( this ).dialog( "close" );
            },
            Cancel: function() {
                $("#dialog-column-list > *").remove();
                $( this ).dialog( "close" );
            }
        }
    });
    $("#elecTable-columns-toggle").on( "click", function() {
        $( "#dialog" ).dialog( "open" );
    });*/
    //#endregion

    //#region Handling electrode objects
    // Add the needed fields to parsed data
    function setupElecRow(elecData) {

        // If it's an older version of elec json then use lepto field for coordinates
        if (!elecData.hasOwnProperty('coords') && elecData.hasOwnProperty('lepto')) {
            elecData['coords'] = elecData['lepto'];
        }

        // Add clinical fields
        const neededFields = ['motor', 'sensory', 'visual', 'auditory', 'language', 'soz', 'spikey'];
        for (field of neededFields) {
            if (!elecData.hasOwnProperty(field)) {
                elecData[field] = false;
            }
        }

        // Add aesthetic fields
        const aesFields = ['shape', 'color', 'size'];
        for (field of aesFields) {
            if (!elecData.hasOwnProperty(field)) {
                elecData[field] = "default";
            }
        }

        // Holder for electrode object that will be added to 3D scene
        elecData['scObj'] = null;
        
        return elecData;
    }

    // Setup aesthetics once table has been created
    function setupAesthetics(elecTable) {

        // First do Tabulator search of table with criteria in custom AES
        aes['custom'].forEach(function (aesCustom) {
            let searchCrit = aesCustom['criteria'];
            let updateParams = aesCustom['outcome'];
            let critRows = elecTable.searchRows(searchCrit);
            if (critRows.length !== 0) {
                critRows.forEach(function (r) {
                    r.update(updateParams);
                });
            }
        });

        // Initiate the electrode object
        elecTable.getRows().forEach(function(elecData) {
            elecData.getData()['scObj'] = new Electrode(elecData);
        })

        return elecTable;
    }

    // Object for DOMs that can hold static images
    imgHolder = {
        domElement1: document.getElementById('elecSlideShow'),
        domElement2: document.getElementById('elecStatic'),
        //activeDOM: document.getElementById('elecSlideShow'),
        //inactiveDOM: document.getElementById('elecStatic'),
        activeDOM: 'elecSlideShow',
        leftButton: document.getElementById('slideshow-bttn-l'),
        rightButton: document.getElementById('slideshow-bttn-r'),
        _slideShowEnabled: false,
        _slideShowIndex: -1,
        visible: null,
        imgs: [],
        enableSlideShow: function () {
            this.leftButton.classList.remove('w3-disabled');
            this.leftButton.disabled = false;
            /*this.leftButton.addEventListener('click', function() {
                debugger;
                this.nextSlide(-1);
            });*/
            this.rightButton.classList.remove('w3-disabled');
            this.rightButton.disabled = false;
            /*this.rightButton.onclick = addEventListener('click', function() {
                this.nextSlide(1);
            });*/
            this._slideShowEnabled = true;
        },
        disableSlideShow: function () {
            this.leftButton.classList.add('w3-disabled');
            this.leftButton.disabled = true;
            //this.leftButton.onclick = null;
            this.rightButton.classList.add('w3-disabled');
            this.rightButton.disabled = true;
            //this.rightButton.onclick = null;
            this._slideShowEnabled = false;
        },
        createImg: function(src) {
            if (src !== undefined) {
                let elecImg = document.createElement("IMG");
                elecImg.src = src;
                elecImg.className = "elecImg";
                elecImg.classList.add('w3-display-center');
                elecImg.onclick = function (event) {
                    if (event.shiftKey) {
                        //imgHolder.imgs.splice(this._slideShowIndex,1);
                        elecImg.remove();
                        imgHolder.nextSlide(-1);
                    }
                }
                return elecImg;
            }
        },
        appendImg: function (srcData) {
            htmlImg = this.createImg(srcData);
            if (!this.imgs.includes(htmlImg)) {
                $(htmlImg).hide();
                //this.imgs.push(htmlImg);
                if (!this._slideShowEnabled && this.activeDOM == 'elecSlideShow') {
                    this.enableSlideShow();
                }
                document.getElementById(this.activeDOM).appendChild(htmlImg);
                this.imgs.push(htmlImg);
                if (this.activeDOM == 'elecSlideShow') {
                    this.nextSlide(1);
                }
                //this.activeDOM.appendChild(htmlImg);
            }
        },
        destroyImg: function(img) {

        },
        destroyImgs: function () {
            forEach(this.imgs, function (ii) {
                ii.remove();
            });
            this.disableSlideShow();
            this._slideShowIndex = -1;
        },
        changeDOM: function () {
            forEach(this.imgs, function (ii) {
                this.inactiveDOM.appendChild(ii);
            });
            let newlyActiveDOM = this.inactiveDOM;
            let newlyInactiveDOM = this.activeDOM;
            this.activeDOM = newlyActiveDOM;
            this.inactiveDOM = newlyInactiveDOM;
            if (this.domElement1 == this.activeDOM) {
                this.enableSlideShow();
            } else {
                this.disableSlideShow();
            }
        },
        nextSlide: function (step) {
            
            let activeImg, nextImg;
            if ($('#elecSlideShow > img').length !== 0) {
                // Find currently active slide
                $('#elecSlideShow > img').each(function(index, el) {
                    if ($(this).css('display') == 'block') {
                        activeImg = $(this);
                        return false;
                    }
                });

                // Determine the next slide
                if (step > 0 && $(activeImg).next().length > 0 ) {
                    nextImg = $(activeImg).next();
                } else if (step > 0 && $(activeImg).next().length === 0 ) {
                    nextImg = $('#elecSlideShow > img:first');
                } else if (step < 0 && $(activeImg).prev().length > 0 ) {
                    nextImg = $(activeImg).prev();
                } else {
                    nextImg = $('#elecSlideShow > img').last();
                }
                $(activeImg).hide();
            } else {
                nextImg = $('#elecSlideShow > img');
            }

            // Show next image
            $(nextImg).css('display','block');
        }
        /*nextSlide: function (step) {
            let currentSlide = this.imgs[this._slideShowIndex];
            let maxSlideIndex = this.imgs.length - 1;
            this._slideShowIndex += step;
            //console.log('Now on slide index' + this._slideShowIndex.toString());
            if (this.imgs.length === 0 && this.activeDOM === this.domElement1) {
                this.disableSlideShow();
                this._slideShowIndex = -1;
                console.log('Now on slide index' + this._slideShowIndex.toString());
                return;
            } else if (this._slideShowIndex > maxSlideIndex) {
                this._slideShowIndex = 0;
                console.log('Now on slide index' + this._slideShowIndex.toString());
            } else if (this._slideShowIndex < 0) {
                this._slideShowIndex = maxSlideIndex;
                console.log('Now on slide index' + this._slideShowIndex.toString());
            }
            let nextSlide = this.imgs[this._slideShowIndex];
            if (currentSlide !== undefined) {
                $(currentSlide).hide();
            }
            $(nextSlide).css('display','block');
        }*/
    };

    $('#slideshow-bttn-l').click( function() {
        imgHolder.nextSlide(-1);
    });

    $('#slideshow-bttn-r').click( function() {
        imgHolder.nextSlide(1);
    });

    // Function for displaying electrode data
    function displayElec(elecData,threed=true,staticImg=true) {
        let scObj = elecData.getData()['scObj'];
        let rowID = elecData.getData()['elecid'];
        let eyeCell = elecData.getCells()[0];
        scObj.init(threed,staticImg);
        if (threed) {
            if (sc.scenes.threeD.scene.getObjectByName(rowID) === undefined) {
                sc.scenes.threeD.scene.add(scObj.threeObj);
                $(eyeCell.getElement()).children('i').addClass('fa fa-eye');
            } else {
                scObj.update();
            }
        }
        if (staticImg && scObj.img !== null) {
            imgHolder.appendImg(elecData.getData()['PICS']);
        }
    }

    // Function for removing electrode from scene
    function removeElec(elecData) {
        let scObj = elecData.getData()['scObj'];
        let rowID = elecData.getData()['elecid'];
        const threeDVisible = document.getElementById("scenesArea").style.display !== "none";
        let eyeCell = elecData.getCells()[0];
        // If object is visible in 3D scene, remove it
        if (threeDVisible && scObj.threeObj !== null) {
            scObj.destroyObj();
            $(eyeCell.getElement()).children('i').removeClass('fa fa-eye');
        }

        // If object is visible in static image scene, delete it
        if (scObj.img !== null) {
            scObj.destroyImg();
        }
    }

    // Electrode Object without being an extension of THREE.Group Class
    function Electrode(elecData) {
        const data = elecData.getData();
        this.row = elecData;
        this.name = data['elecid'];
        this.color = data['color'];
        this.size = data['size'];
        this.shape = data['shape'];
        this.coords = data['coords'];
        this.threeObj = null;
        this._Mesh = null;
        this._TextMesh = null;
        this._elecSize = 1;
        this._textSize = 1;
        this.img = null;
        //this.init();
        this.createThreeObj = function() {
            this.threeObj = new THREE.Group();
            this.threeObj.scale.set(this.getSize(),this.getSize(),this.getSize());
            this.threeObj.position.set(this.coords[0],this.coords[1],this.coords[2]);
            this.threeObj.type = "Electrode";
            this.threeObj.name = this.name;
            this.createElecMesh();
            this.createTextMesh();
            this.row.update({"scObj": this});
        };
        this.createImage = function() {
            const imgSrc = this.row.getData()['PICS'];
            if (imgSrc !== undefined) {
                let elecImg = document.createElement("IMG");
                elecImg.src = imgSrc;
                elecImg.id = this.name + "-elecImg"
                elecImg.className = "elecImg";
                elecImg.classList.add('w3-display-center');
                elecImg.row = this.row;
                elecImg.onclick = function (event) {
                    if (event.shiftKey) {
                        this.row.getData().scObj.destroyImg();
                        imgHolder.nextSlide(-1);
                    }
                }
                this.img = elecImg;
            }
        };
        this.createElecMesh = function() {
            const eShape = this.getShape();
            let mesh = aes['shapeGuide'][eShape](this._elecSize);
            //const mesh = shapeGuide[this.shape](this._elecSize);
            const mat = new THREE.MeshLambertMaterial({
                color: this.getColor()
            });
            this._Mesh = new THREE.Mesh(mesh, mat);
            this.threeObj.add(this._Mesh);
        };
        this.createTextMesh = function () {
            const geom = new THREE.TextBufferGeometry(this.name, {
                font: sc.font,
                size: this._textSize,
                height: 0.1
            });
            const mat = new THREE.MeshBasicMaterial({
                color: this.getColor()
            });
            this._TextMesh = new THREE.Mesh(geom, mat);
            this._TextMesh.position.z = this.getSize();
            this._TextMesh.type = "elecText";
            this._TextMesh.onAfterRender = function() {
                const camera = sc.scenes.threeD.camera;
                this.lookAt(camera.position.x,camera.position.y,camera.position.z);
                this.rotation.setFromRotationMatrix(camera.matrix);
            }
            this.threeObj.add(this._TextMesh);
        };
        this.getColor = function() { 
            return this.color == "default" ? aes['default']['color'] : this.color;
        };
        this.setColor = function(newColor) {
            this.color = newColor;
            if (this.threeObj!== null) {
                newColor = this.getColor();
                this._Mesh.material.color = new THREE.Color(newColor);
                this._TextMesh.material.color = new THREE.Color(newColor);
            }
        };
        this.getElecSize = function() {
            return this._elecSize;
        };
        this.setElecSize = function(newSize) {
            this._elecSize = newSize;
            if (this.threeObj!== null) {
                this._Mesh.scale.set(newSize,newSize,newSize);
            }
        };
        this.getTextSize = function() {
            return this._textSize;
        };
        this.setTextSize = function(newSize) {
            this._textSize = newSize;
            if (this.threeObj!== null) {
                this._TextMesh.scale.set(newSize,newSize,newSize);
            }
        };
        this.getSize = function() { 
            return this.size === "default" ? aes['default']['size'] : this.size;
        };
        this.setSize = function(newSize) {
            this.size = newSize;
            if (this.threeObj!== null) {
                newSize = this.getSize();
                this.threeObj.scale.set(newSize,newSize,newSize);
            }
        };
        this.getShape = function() { 
            return this.shape == "default" ? aes['default']['shape'] : this.shape;
        };
        this.setShape = function(newShape) {
            this.shape = newShape;
            if (this.threeObj!== null) {
                newShape = this.getShape();
                this.threeObj.remove(this._Mesh);
                this._Mesh = null;
                this.createElecMesh();
            }
        };
        this.update = function() {
            const rowColor = this.row.getData()['color'];
            const rowSize = this.row.getData()['size'];
            const rowShape = this.row.getData()['shape'];
            if (this.threeObj !== null) {
                this.setShape(rowShape);
                this.setColor(rowColor);
                this.setSize(rowSize);
            }
        };
        this.destroyObj = function() {
            this.threeObj.parent.remove(this.threeObj);
            this.threeObj = null;
            this.row.update({"scObj": this});
        };
        this.destroyImg = function() {
            this.img.remove();
            this.img = null;
            this.row.update({"scObj": this});
        };
        this.init = function(threed=true,staticImg=true) {
            if (threed && this.threeObj === null) {
                //this.createElecMesh();
                //this.createTextMesh();
                //this.threeObj.scale.set(this.size,this.size,this.size);
                this.createThreeObj();
            }
            if (staticImg && this.img === null) {
                this.createImage();
            }
            this.row.update({"scObj": this});
        };
    }

    //#endregion

    //#region elecTable Things
    // Create the elecTable right-click rows
    const rowMenu = [{
            label: "<i class='fa fa-edit'></i> Edit Selected",
            action: function (e, row) {
                //row.getTable().selectRow();
                console.log('Editing!');
            }
        },
        {
            label: "<i class='fa fa-edit'></i> Display Selected",
            action: function (e, row) {
                //row.getTable().selectRow();
                e.preventDefault();
                let selectedRows = row.getTable().getSelectedRows();
                selectedRows.forEach(function(rowX) {
                    displayElec(rowX);
                })
            }
        }
    ];

    // Columns for the elecTable
    let elecTableColumns = [
        {
            formatter: function() {return "<i class=''></i>";},
            titleFormatter: function() {return "<i class='fa fa-eye'></i>";},
            width: 30,
            frozen: true,
            headerSort:false,
            download:false,
            cellClick: function(e,cell){
                const isShown3D = cell.getData().scObj.threeObj !== null;
                const isShownImg = cell.getData().scObj.img !== null;
                let row = cell.getRow();
                if (!isShown) {
                    displayElec(row);
                } else {
                    removeElec(row);
                }
            }
        },
        {
            title: "elecID",
            field: "elecid",
            visible: true,
            headerFilter: "input",
            editable: false,
            frozen: true,
            /*accessorDownload: function(value, data, type, params, column){
                debugger;
                console.log(value);
            },
            accessorDownloadParams:{checked: true}*/
        },
        {
            title: "SOZ",
            field: "soz",
            formatter: "tickCross",
            editable: false,
            visible: true,
            editor: true
        },
        {
            title: "SPIKEY",
            field: "spikey",
            formatter: "tickCross",
            editable: false,
            visible: true,
            editor: true,
        },
        {
            title: "Anat",
            field: "anat",
            editable: false,
            visible: true,
            headerFilter: "input"
        },
        {
            title: "Motor",
            field: "motor",
            formatter: "tickCross",
            editable: false,
            visible: true,
            editor: true
        },
        {
            title: "Sensory",
            field: "sensory",
            formatter: "tickCross",
            editable: false,
            editor: true
        },
        {
            title: "Visual",
            field: "visual",
            formatter: "tickCross",
            visible: true,
            editable: false,
            editor: true
        },
        {
            title: "Auditory",
            field: "auditory",
            formatter: "tickCross",
            visible: true,
            editable: false,
            editor: true
        },
        {
            title: "Language",
            field: "language",
            formatter: "tickCross",
            visible: true,
            editable: false,
            editor: true
        }
    ];

    // Function to create elecTable
    function createElecTable(inputData) {
        let elecTable = new Tabulator('#elecTable', {
            placeholder: "Waiting for electrode json file",
            data: inputData,
            layout: "fitData",
            index: "elecid",
            //height: "100%",
            downloadReady:function(fileContents, blob){debugger;},
            resizableColumns: true,
            downloadConfig: {
                rowGroups: false,
                columnGroups: false,
                dataTree:false
            },
            downloadRowRange:"all",
            selectablePersistence: false,
            columnMinWidth: 10,
            rowContextMenu: rowMenu,
            selectable: true,
            groupDblClick: function (e, group) {
                group.getRows().forEach(function (row) {
                    row.toggleSelect();
                })
            },
            groupBy: ["gridid"],
            groupStartOpen: [false],
            columns: elecTableColumns
        });
        elecTable = setupAesthetics(elecTable);
        sc.elecTable.obj = elecTable;
        return elecTable;
    }

    // Make the buttons above the table into a controlgroup
    $("#elecTable-buttons").controlgroup();

    // Button to select all rows
    $("#bttns-selectall").click(function () {
        if (sc.elecTable.obj != null) {
            sc.elecTable.obj.selectRow(sc.elecTable.obj.getData('active'));
        }
    });

    // Update electrodes when update button pressed
    function updateElecRows() {
        let customAes = aes['custom'];
        for (a of customAes) {
            let foundRows = sc.elecTable.obj.searchRows(a['criteria']);
            if (foundRows.length !== 0) {
                foundRows.forEach(function (r) {
                    r.update(a['outcome']);
                    if (r.getData()['scObj'] !== null) {
                        r.getData()['scObj'].update();
                    }
                })
            }
        }
    }

    // Button to update elecTable after changes
    $("#bttns-update").click(function () {
        if (sc.elecTable.obj != null) {
            //updateElecRows();
            aes.updateAesthetics(false);
        }
    });

    //#endregion

    //#region Parsing functions

    // Parse electrodes json file
    function parseElecJson(idx, files, table) {
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
                    setupElecRow(elecObj);
                })
                return parsedText;
            })
            .then(function (elecData) {
                //debugger;
                elecTable = createElecTable(elecData);
                // Checkbox to enable editing of elecTable
                editableColumns = ['soz', 'spikey', 'motor', 'sensory', 'visual', 'auditory', 'language'];
                let editColButton = document.getElementById("bttns-editmode");
                editColButton.addEventListener('click', function (event) {
                    editableColumns.forEach(function (col) {
                        elecTable.updateColumnDefinition(col, {
                            editable: editColButton.checked
                        })
                    })
                });
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse freesurfer meshes
    function parseFSMesh(idx, files) {
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
                    transparent: true
                });
                material.side = THREE.FrontSide;
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
                    mesh.material.depthWrite = false;
                }

                // Add to scene
                scene.add(mesh);
                controller = addGui4Surf(mesh);

                // Store the types of skins and their controllers this mesh has
                mesh.userData['skins'] = {
                    default: {
                        material: material,
                        controller: controller
                    }
                };
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Adding a controller for volumes
    // Make subfolders for volume function
    function planeController(obj, name, axes) {
        //debugger;
        let parentFolder = sc.datGui.objs['vol'];
        let planeFolder = parentFolder.addFolder(name);
        let origDir = obj.slice.planeDirection;
        //debugger;
        planeFolder.add(obj, 'index', 0, obj.orientationMaxIndex, 1).name('Slice').listen();
        for (ax of axes) {
            planeFolder.add(obj.slice.planeDirection, ax, -Math.PI * 2, Math.PI * 2, 0.1).name('Rotate' + ax.toUpperCase()).onChange(function (newVal) {
                //debugger;
                obj.slice.planeDirection = new THREE.Vector3().set(this.object.x, this.object.y, this.object.z);
                obj.border.helpersSlice = obj.slice;
            });
        }

        planeFolder.add(obj, 'visible').name('Visible');
        return planeFolder;
    }

    function scenePlaneController(obj, name, axes, planePosition) {
        //debugger;
        let parentFolder = sc.datGui.objs['vol'];
        let planeFolder = parentFolder.addFolder(name);
        //debugger;
        planeFolder.add(obj.position, planePosition, -128, 128, 1).name('Slice').listen();
        for (ax of axes) {
            planeFolder.add(obj.rotation, ax, -Math.PI/2, Math.PI/2, 0.1).name('Rotate' + ax.toUpperCase()).onChange(function (newVal) {
                obj.rotation.set(this.object.x, this.object.y, this.object.z);
                //debugger;
                //obj.slice.planeDirection = new THREE.Vector3().set(this.object.x, this.object.y, this.object.z);
                //obj.border.helpersSlice = obj.slice;
            });
        }

        planeFolder.add(obj, 'visible').name('Visible');
        return planeFolder;
    }

    // Parse Volumes
    function parseVolume(idx, files) {
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
                        'axes': ['x', 'z'],
                        'pos': 'y'
                    },
                    'Saggital': {
                        'ori': 1,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x00ff00,
                        'axes': ['y', 'z'],
                        'pos': 'x'
                    },
                    'Axial': {
                        'ori': 2,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x0000ff,
                        'axes': ['x', 'y'],
                        'pos': 'z'
                    }
                };
                for (plane in orients) {
                    vol[`${plane}`] = orients[plane]['obj'];
                    orients[plane]['obj'].name = plane;
                    orients[plane]['obj'].border.color = orients[plane]['color'];
                    orients[plane]['obj'].children[0].visible = false;
                    orients[plane]['obj'].orientation = orients[plane]['ori'];
                    
                    let newScene = new THREE.Scene(); newScene.add(orients[plane]['obj']);
                    scenePlaneController(newScene,plane,orients[plane]['axes'],orients[plane]['pos']);
                    sc.scenes.threeD.scene.add(newScene);

                    //planeController(orients[plane]['obj'], plane, orients[plane]['axes']);
                    //sc.scenes.threeD.scene.add(orients[plane]['obj']);
                }
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Initiate dat.gui
    function initSceneGui() {
        let sceneGui = new dat.GUI({
            autoPlace: false,
            width: 200,
            resizable: true
        });
        let dispFolder = sceneGui.addFolder('Display');
        let cam = sc.scenes.threeD.camera;
        cam['reCenterCamera'] = function () {
            this.position.x = 250;
            this.position.y = 250;
            this.position.z = 250;
        }
        dispFolder.add(cam, 'reCenterCamera').name('Recenter');
        const rendColors = {
            currentColor: 'White'
        };
        dispFolder.add(rendColors, 'currentColor', ['White', 'Black', 'PowderBlue']).name('Background').onChange(function (newColor) {
            sc.scenes.threeD.renderer.setClearColor(newColor.toLocaleLowerCase(), 1);
        });
        let elecsFolder = sceneGui.addFolder('Electrode Settings');
        elecsFolder.add(aes,'elecTextVisible').name('Text').listen().onChange(function() {
            // Recurse through 3D scene and if the object contains elecText, toggle it
            sc.scenes.threeD.scene.children.forEach(function(o){
                let elecText = o.getObjectByProperty('type', 'elecText');
                if (elecText !== undefined) {
                    elecText.visible = aes['elecTextVisible'];
                }
            });
        });
        let surfsFolder = sceneGui.addFolder('Surfaces');
        let volFolder = sceneGui.addFolder('Volumes');
        sc.datGui.objs['parent'] = sceneGui;
        sc.datGui.objs['surf'] = surfsFolder;
        sc.datGui.objs['elecs'] = elecsFolder;
        sc.datGui.objs['vol'] = volFolder;
        const guiContainer = document.getElementById('sceneGui-container');
        guiContainer.appendChild(sceneGui.domElement);
    }


    // Adding dat.gui to the scene for meshes
    function addGui4Surf(mesh) {
        let surfFolder = sc.datGui.objs['surf'];
        let newSurfFolder = surfFolder.addFolder(mesh.name);
        newSurfFolder.add(mesh.material, 'opacity', 0, 1).name('Opacity');
        let dummyColor = {
            color: "#" + mesh.material.color.getHexString()
        };
        let colorChanger = newSurfFolder.addColor(dummyColor, 'color').name('Color');
        //colorChanger.initialValue = "#" + mesh.material.color.getHexString();
        colorChanger.onChange(function (colorVal) {
            let newColor = colorVal.replace('#', '0x');
            mesh.material.color.setHex(newColor);
        });
        return surfFolder;
    }


    //#endregion

    //#region THREE.JS and Adding to Scenes

    // Set up THREE.JS 3D scene
    function init3DScene() {
        const threeD = document.getElementById("threeDviewArea");

        // Display the legend
        $("#legend").show();
        $("#edit-legend-bttn").button();
        //$("#edit-legend-bttn").click(createEditorDialog);
        $( "#edit-legend-bttn" ).on( "click", function() {
            $( "#dialog" ).dialog( "open" );
            aes.createEditorDialog();
        });

        //#region Classic ThreeJS setup
        // ThreeJS renderer
        let renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        sc.scenes.threeD.renderer = renderer;
        renderer.setSize(threeD.offsetWidth, threeD.offsetHeight);
        renderer.setClearColor(0xffffff, 1);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // Make canvas element responsize to resize
        renderer.domElement.classList.add('w3-col');
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.width = "100%";
        threeD.appendChild(renderer.domElement);

        // ThreeJS scene
        scene = new THREE.Scene();
        sc.scenes.threeD.scene = scene;

        // ThreeJS camera
        let camera = new THREE.PerspectiveCamera(45, threeD.clientWidth / threeD.clientHeight, 1, 1000);
        camera.position.x = 250;
        camera.position.y = 250;
        camera.position.z = 250;
        sc.scenes.threeD.camera = camera;
        //#endregion

        // Lighting for the scene
        let light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.copy(camera.position);
        scene.add(light);

        // AMI style trackball
        let controls = new AMI.TrackballControl(camera, renderer.domElement);
        controls.update();
        sc.scenes.threeD.controls = controls;

        // The font to be used in THREE.js scenes
        const font = new THREE.FontLoader().parse(rawText);
        sc.font = font;

        // Change variable to indicate the viewer is switched on
        init3 = true;

        initSceneGui();

        //Check when need to resize canvas
        function rendererSizeChecker(renderer) {
            const canvas = renderer.domElement;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const needResize = canvas.width !== width || canvas.height !== height;
            if (needResize) {
              renderer.setSize(width, height,false);
            }
            return needResize;
        }

        // Run the animation loop
        const animate = () => {
            
            // If need to resize renderer, update camera
            if (rendererSizeChecker(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            
            controls.update();
            light.position.copy(camera.position);
            renderer.render(scene, camera);

            requestAnimationFrame(function () {
                animate();
            });
        }
        animate();
    }

    //#endregion

    //#region Load Button listener
    $("#load-bttn").change(function (e) {

        // Bin the input files based on file extension
        for (i = 0; i < e.target.files.length; i++) {

            // Get basic params of this file
            var _fname = e.target.files[i].name;
            var _fext = _fname.split('.').pop().toLowerCase();
            // Decide what kind of file it is and how to load it
            if (sc.dtypes['FSmesh']['extensions'].indexOf(_fext) >= 0) {
                if (!init3) {
                    init3DScene();
                }
                parseFSMesh(i, e.target.files);
            } else if (sc.dtypes['electrodes']['extensions'].indexOf(_fext) >= 0) {
                parseElecJson(i, e.target.files); //parse as electrodes json file
            } else if (sc.dtypes['volumes']['extensions'].indexOf(_fext) >= 0) {
                if (!init3) {
                    init3DScene();
                }
                parseVolume(i, e.target.files);
            } else {
                alert('Unknown file type!');
            }
        }

    })
    //#endregion

    //#region How to initiate scene
    $("#chng-view1").trigger("click"); // Start in view1
    //createElecTable();
    //#endregion


});