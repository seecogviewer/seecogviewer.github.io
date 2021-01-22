var vol = {
    'Coronal': null,
    'Saggital': null,
    'Axial': null,
    'foci': {
        'id': [],
        'x': [],
        'y': [],
        'z': []
    }
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
        Saggital: {
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
 var aes, imgHolder, elecTable, scene;

$(document).ready(function () {


    let init3 = false;
    //let scene, elecTable;

    //#region Aesthetics: Displaying Electrodes
    aes = {
        default: {shape: "sphere", color: "black",size: 2}, //aesDefaults,
        elecTextVisible: true, // Whether to show elec name hovering over elec in scenes
        // Custom aesthetic settings
        custom: [
            {
                criteria: [{field: "motor", type: "=",value: true}],
                outcome: {shape: "cube"},
                display: true
            },
            {
                criteria: [{field: "sensory", type: "=",value: true}],
                outcome: {shape: "dodecahedron"},
                display: true
            },
            {
                criteria: [{field: "visual", type: "=",value: true}],
                outcome: {shape: "tetrahedron"},
                display: true
            },
            {
                criteria: [{field: "auditory", type: "=",value: true}],
                outcome: {shape: "cone"},
                display: true
            },
            {
                criteria: [{field: "language", type: "=",value: true}],
                outcome: {shape: "octahedron"},
                display: true
            },
            {
                criteria: [{field: "soz", type: "=",value: true}],
                outcome: {color: "red", size: 3},
                display: true
            },
            {
                criteria: [{field: "spikey", type: "=",value: true}],
                outcome: {color: "green", size: 3},
                display: true
            }
        ],
        tmpEditor: {default: null,custom: null}, // Holder for when updating how elecs look
        shapeGuide: { // The possible shapes for elecs
            cube: (h) => new THREE.BoxBufferGeometry(h, h, h),
            sphere: (r) => new THREE.SphereBufferGeometry(r, 32, 32),
            dodecahedron: (r) => new THREE.DodecahedronBufferGeometry(r, 0),
            tetrahedron: (r) => new THREE.TetrahedronBufferGeometry(r, 0),
            cone: (r) => new THREE.ConeBufferGeometry(r, r, 10),
            octahedron: (r) => new THREE.OctahedronBufferGeometry(r,0),
        },
        resetAesthetics: function(selected=false) { // Change row back to default aesthetics
            let rows2Update;
            if (selected === true) {
                rows2Update = elecTable.obj.getSelectedRows();
            } else {
                rows2Update = elecTable.obj.getRows();
            }
            rows2Update.forEach(function(r) {
                r.update({color: 'default', size: 'default', shape: 'default'});
            });
        },
        updateRowValues: function(selected=false) { // Update appearance based on new settings
            let customAes = this.custom;
            for (a of customAes) {
                
                // Only implement custom setting if opted to actually display it
                if (a['display'] !== true) {
                    continue;
                } else {
                    let foundRows = elecTable.obj.searchRows(a['criteria']);
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
            }
        },
        updateScObjs: function(selected=false) { // Update appearance directly on objects
            let rows2Update;
            if (selected === true) {
                rows2Update = elecTable.obj.getSelectedRows();
            } else {
                rows2Update = elecTable.obj.getRows();
            }
            rows2Update.forEach( function(r) {
                r.getData()['scObj'].update();
            });
        },
        updateAesthetics: function(selected=false) { // Call 3 functions to do full update
            this.resetAesthetics(selected);
            this.updateRowValues(selected);
            this.updateScObjs(selected);
        },
        tmp2Aesthetics: function() { // Update custom aesthetics completely
            
            // The new settings
            let newSettings = this.tmpEditor.custom;
            let newDefaultSettings = this.tmpEditor.default;

            // First start with default
            let newDefaults = newDefaultSettings.getRows()[0];            
            this.default.shape = newDefaults.getData()['shape'];
            this.default.size = newDefaults.getData()['size'];
            this.default.color = newDefaults.getData()['color'];


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
                newCustom['display'] = r.getData()['display'];
                aes.custom.push(newCustom);
            });

            this.updateAesthetics(false);
        },
        createEditorDialog: function() { // Initiate dialog to change appearances
            // Dialog for changing elec aesthetics
            let dialogRows = [];
            let defaultSettings = {...aes['default']};
            //defaultSettings['field'] = 'default';
            //dialogRows.push(defaultSettings);
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
                currentSettings['display'] = c['display'];
                dialogRows.push(currentSettings);
            });
    
            let dialogColumns = [
                {title: 'Property', field: 'field'},
                {title: 'Shape', field: 'shape', editor: 'select', editorParams: {values: {"default": "default","cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                {title: 'Color', field: 'color', editor: 'select', editorParams: {values: {"default": "default", "red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                {title: 'Size', field: 'size', editor: 'select', editorParams: {values: {"default": "default", "1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3.5, "default": "default"} }},
                {title: 'Active', field: 'display', formatter: "tickCross", editor: true, hozAlign: 'center', headerSort: false}
            ];
    
            let editorTable = new Tabulator('#editorTable', {
                data: dialogRows,
                index: 'field',
                layout:"fitColumns",
                columns: dialogColumns,
                columnMinWidth: 60
            });
            this.tmpEditor['custom'] = editorTable;

            // Create mini default table
            let editorTableDefault = new Tabulator('#editorTable-default', {
                data: [defaultSettings],
                index: 'field',
                layout:"fitColumns",
                columns: [
                    {title: 'Shape', field: 'shape', editor: 'select', editorParams: {values: {"cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                    {title: 'Color', field: 'color', editor: 'select', editorParams: {values: {"red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                    {title: 'Size', field: 'size', editor: 'select', editorParams: {values: {"1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3.5, "default": "default"} }}
                ],
                columnMinWidth: 60
            });
            this.tmpEditor['default'] = editorTableDefault;
    
        },
        validateEditorDialog: function() {
            /*let defaultRow = this.tmpEditor.getRow('default').getData();
            const shapeIsDefault = defaultRow['shape'] === 'default';
            const colorIsDefault = defaultRow['color'] === 'default';
            const sizeIsDefault = defaultRow['size'] === 'default';
            if (shapeIsDefault || colorIsDefault || sizeIsDefault) {
                return false;
            } else {
                return true;
            }*/
            return true;
        },
        initLegend: function() {
            $("#legend").show();
            $("#edit-legend-bttn").button();
            //$("#edit-legend-bttn").click(createEditorDialog);
            $( "#edit-legend-bttn" ).on( "click", function() {
                $( "#aesEditorDialog" ).dialog( "open" );
                aes.createEditorDialog();
            });
        }
    };

    // Set the dialogue box that will have editing aesthetic options
    $("#aesEditorDialog").dialog({
        resizable: true,
        autoOpen: false,
        width: 700,
        height: 500,
        modal: true,
        buttons: {
            "Update": function() {
                if (!aes.validateEditorDialog) { //No longer needed
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
    //#endregion

    //#region elecTable object and associated buttons

    // Function for checking if cells can be edited or not on click
    function check2update(e,cell) {
        if (document.getElementById("bttns-editmode").checked) {
            cell.setValue( !cell.getValue() );
        }
    }

    // The primary elecTable object
    elecTable = {
        obj: null,
        domID: "elecTableChild",
        groupBy: ['gridid'],
        tmpColumnUpdate: null,
        tmpSelectedEditor: {'aes': null, 'properties': null},
        selectedUpdatorDialog: function() {

            // Setup Aesthetics editor
            let aesColumns = [
                {title: 'Shape', field: 'shape', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change","default": "default","cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                {title: 'Color', field: 'color', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change", "default": "default", "red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                {title: 'Size', field: 'size', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change", "default": "default", "1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3.5, "default": "default"} }},
            ];
            let aesRow = [{shape: 'No Change', color: 'No Change', size: 'No Change'}];
            let aesTable = new Tabulator('#selectedEditorDialog-aes', {
                data: aesRow,
                //index: 'field',
                layout:"fitColumns",
                columns: aesColumns,
                columnMinWidth: 60
            });
            this.tmpSelectedEditor['aes'] = aesTable;

            // Setup property editor
            let propColumns = [];
            let propRow = {};
            let columnDefs = elecTable.obj.getColumnDefinitions().slice(2);
            
            for (c of columnDefs) {
                if (c.field === 'anat' || c.field === 'gridid') { continue;}                
                let newProp = {'title': c.title, 'field': c.field, headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change", true: true, false: false} }};
                propColumns.push(newProp);
                propRow[`${c.field}`] = "No Change";
            };
            
            let propTable = new Tabulator('#selectedEditorDialog-props', {
                data: [propRow],
                //index: 'field',
                layout:"fitColumns",
                columns: propColumns,
                columnMinWidth: 60
            });
            this.tmpSelectedEditor['properties'] = propTable;
        },
        updateSelectedElecs: function(){
            // blah
            let todos = [];
            let selectedRows = elecTable.obj.getSelectedRows();

            // Now update properties
            let propSettings = this.tmpSelectedEditor['properties'].getData()[0];
            for (p in propSettings) {
                if (propSettings[p] == "No Change") {
                    continue;
                } else {
                    for (r of selectedRows) {
                        const result = propSettings[`${p}`] == "true";
                        r.update({[`${p}`]: result});
                    }
                }
            }
            aes.updateRowValues(true);
            
            // Now update aesthetics
            let aesSettings = this.tmpSelectedEditor['aes'].getData()[0];
            for (a in aesSettings) {
                if (aesSettings[a] == "No Change") {
                    continue;
                } else {
                    for (r of selectedRows) {
                        r.update({[`${a}`]: aesSettings[`${a}`]});
                    }
                }
            }

            // Go through all promises
            /*Promise.all(todos)
            .then(function() {
                aes.updateScObjs(true);
            })
            .catch(function(error){
                console.log(error);
                console.log('Uh Oh. Something went wrong on updating select Eelcs');
            });*/
            aes.updateScObjs(true);

        },
        elecTableColumns: [
            {
                formatter: function() {return "<i class=''></i>";},
                titleFormatter: function() {return "<i class='fa fa-eye'></i>";},
                width: 50,
                frozen: true,
                headerSort:false,
                headerMenu: [
                    {
                        label: 'Show All',
                        action: function(e,column) {
                            console.log('Showing all elecs!');
                        }
                    },
                    {
                        label: 'Show Only Visible',
                        action: function(e,column) {
                            console.log('Showing only currently visible elecs!');
                        }
                    }
                ],
                cellClick: function(e,cell){
                    const isShown3D = cell.getData().scObj.threeObj !== null;
                    const isShownImg = cell.getData().scObj.img !== null;
                    let row = cell.getRow();
                    if (!isShown3D) {
                        elecTable.displayElec(row);
                    } else {
                        elecTable.removeElec(row);
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
            },
            {
                title: 'gridID',
                field: 'gridid',
                visible: false,
                editable: false
            },
            {
                title: "SOZ",
                field: "soz",
                formatter: "tickCross",
                editable: false,
                visible: true,
                editor: true,
                cellClick: check2update
            },
            {
                title: "SPIKEY",
                field: "spikey",
                formatter: "tickCross",
                editable: false,
                visible: true,
                editor: true,
                cellClick: check2update
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
                editor: true,
                cellClick: check2update
            },
            {
                title: "Sensory",
                field: "sensory",
                formatter: "tickCross",
                editable: false,
                visible: true,
                editor: true,
                cellClick: check2update
            },
            {
                title: "Visual",
                field: "visual",
                formatter: "tickCross",
                visible: true,
                editable: false,
                editor: true,
                cellClick: check2update
            },
            {
                title: "Auditory",
                field: "auditory",
                formatter: "tickCross",
                visible: true,
                editable: false,
                editor: true,
                cellClick: check2update
            },
            {
                title: "Language",
                field: "language",
                formatter: "tickCross",
                visible: true,
                editable: false,
                editor: true,
                cellClick: check2update
            }
        ],
        rowMenu: [{
                label: "<i class='fa fa-edit'></i> Edit Selected",
                action: function (e, row) {
                    //row.getTable().selectRow();
                    //console.log('Editing!');
                    $( "#selectedEditorDialog" ).dialog( "open" );
                    elecTable.selectedUpdatorDialog();
                }
            },
            {
                label: "<i class='fa fa-edit'></i> Display Selected",
                action: function (e, row) {
                    //row.getTable().selectRow();
                    e.preventDefault();
                    let selectedRows = row.getTable().getSelectedRows();
                    selectedRows.forEach(function (rowX) {
                        elecTable.displayElec(rowX);
                    })
                }
            }
        ],
        createElecTable: function(inputData) {
            let t = new Tabulator('#elecTable', {
                placeholder: "Waiting for electrode json file",
                data: inputData,
                layout: "fitData",
                index: "elecid",
                //height: "100%",
                resizableColumns: true,
                movableColumns: true,
                groupHeader: function(value,count,data,group) {
                    return value + "<span class='row-hdr-span' style='color:#000; margin-left:10px; margin-right:10px; font-weight: 100; font-size: 12px;'>- " + count + " Electrodes</span>";
                },
                groupContextMenu: [
                    {
                        label: "Select All",
                        action: function(e,group) {
                            group.getRows().forEach(function(r) {r.select();})
                        }
                    },
                    {
                        label: "Show All",
                        action: function(e,group) {
                            group.show();
                            group.getRows().forEach(function(r) {
                                if (r.getData().scObj.threeObj === null) {
                                    elecTable.displayElec(r);
                                }
                            })
                        }
                    },
                    {
                        label: "Remove All",
                        action: function(e,group) {
                            group.show();
                            group.getRows().forEach(function(r) {
                                if (r.getData().scObj.threeObj !== null) {
                                    elecTable.removeElec(r);
                                }
                            })
                            group.hide();
                        }
                    }
                ],
                selectablePersistence: false,
                columnMinWidth: 10,
                rowContextMenu: this.rowMenu,
                selectable: true,
                groupDblClick: function (e, group) {
                    group.getRows().forEach(function (row) {
                        row.toggleSelect();
                    })
                },
                groupBy: this.groupBy,
                groupStartOpen: [false],
                columns: this.elecTableColumns
            });
            t = this.setupAesthetics(t);
            this.obj = t;
            return t;
        },
        setupElecRow: function (elecData, filetype) { // Setup needed data for table
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

            // Add the anat field if it's not there
            if (!elecData.hasOwnProperty('anat')) {
                elecData['anat'] = 'Unknown';
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
        },
        setupAesthetics: function (t) { // Create aesthetic params
            // First do Tabulator search of table with criteria in custom AES
            aes['custom'].forEach(function (aesCustom) {
                let searchCrit = aesCustom['criteria'];
                let updateParams = aesCustom['outcome'];
                let critRows = t.searchRows(searchCrit);
                if (critRows.length !== 0) {
                    critRows.forEach(function (r) {
                        r.update(updateParams);
                    });
                }
            });

            // Initiate the electrode object
            t.getRows().forEach(function (elecData) {
                elecData.getData()['scObj'] = new Electrode(elecData);
            })

            return t;
        },
        displayElec: function(elecData,threed=true,staticImg=true) {
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
        },
        removeElec: function(elecData) {
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
        },
        createColumnUpdateDialog: function() { // Create dialogue to update column definition

            // Set the columns for this table
            let dialogColumns = [
                {rowHandle:true, formatter:"handle", headerSort:false, frozen:true, width:30, minWidth:30},
                {title: 'Column', field: 'column'},
                {title: 'Visible', field: 'isVisible', formatter: "tickCross", editor: true, hozAlign: 'center'},
                {title: 'GroupBy', field: 'groupBy', formatter: "tickCross", editor: true, hozAlign: 'center'},
                {title: 'Filter', field: 'filter', editor:"select", editorParams:{values:{"None":"None", "Yes":"Yes", "No":"No"}} },
            ];

            // Get column definitions. Use as rows
            let dialogRows = [];
            let columnDefs = elecTable.obj.getColumnDefinitions().slice(2);
            columnDefs.forEach(function(c) {
                const isGrouped = c['field'].indexOf(elecTable.groupBy) !== -1 ? true: false;
                let newRow = {'column': c.title, 'fieldname': c.field, 'isVisible': c.visible, 'groupBy': isGrouped, 'filter': ""};
                dialogRows.push(newRow);
            });

            // Create the table
            let columnTable = new Tabulator('#columnEditor', {
                data: dialogRows,
                index: 'column',
                movableRows:true,
                layout: 'fitColumns',
                columns: dialogColumns,
                columnMinWidth: 60
            });

            this.tmpColumnUpdate = columnTable;
        },
        updateColumnSettings: function() {
            let newColSettings = this.tmpColumnUpdate.getRows();
            let tableGroups = [];
            let todos = [];

            // Loop through each column setting
            newColSettings.forEach(function(colSettings) {

                let c = colSettings.getData();

                // Check if column should be grouped in rows
                if (c.groupBy) {
                    tableGroups.push(c.fieldname);
                }

                // Change visibility
                //let newTodo = elecTable.obj.updateColumnDefinition(c.fieldname, {visible: c.isVisible});
                //todos.push(newTodo);
                if (c.isVisible) {
                    elecTable.obj.showColumn(c.fieldname);
                } else {
                    elecTable.obj.hideColumn(c.fieldname);
                }
            })

            // Redefine how rows are grouped
            this.groupBy = tableGroups;
            this.obj.setGroupBy(tableGroups);
            /*let groupByPromise = this.obj.setGroupBy(tableGroups);
            todos.push(groupByPromise);

            // Initiate all the promises
            Promise.all(todos).catch(function(error) {
                window.console.log('Whoops! Something went wrong in updateColumnSettings');
                window.console.log(error);
            })*/

        },
        table2csv: function() {
            // Grab table data
            let fields2get = []; // Which fields to download
            let rowdata = [];
            fields2get.push(this.obj.getColumns()[1].getField());
            this.obj.getColumns().slice(3).forEach(function(c) {
                fields2get.push(c.getField());
            });

            let colNames = fields2get.concat(["x", "y", "z"]);
            rowdata.push(colNames.join(',') + ",\n");

            // Go through each row to get data
            this.obj.getRows().forEach(function(r) {
                let thisRow = [];
                for (f of fields2get) {
                    thisRow.push(r.getData()[f]);
                }
                // Now grab coordinates
                for (cii of [0,1,2]) {
                    thisRow.push(r.getData()['coords'][cii]);
                }
                
                thisRowStr = thisRow.join(',') + ",\n";
                rowdata.push([thisRowStr]);
            });
            return rowdata;
        },
        downloadTable: function(data) {
            let file = new File(data, "seecog_table.csv", {type: "data:text/csv;charset=utf-8"});
            saveAs(file);
        }
    }

    // Assign download function to a button
    $("#download-bttn").click(function() {
        if (elecTable.obj !== null) {
            let data = elecTable.table2csv();
            elecTable.downloadTable(data);
        } else {
            alert("Sorry! Can't download something that doesn't exist!")
        }
    });

    // Make the buttons above the table into a controlgroup
    $("#elecTable-buttons").controlgroup();

    // Button to select all rows
    $("#bttns-selectall").click(function () {
        if (elecTable.obj != null) {
            elecTable.obj.selectRow(elecTable.obj.rowManager.activeRows);
        }
    });

    // Button to update elecTable after changes
    $("#bttns-update").click(function () {
        if (elecTable.obj != null) {
            aes.updateAesthetics(false);
        }
    });

    // Set the button for updating column definitions
    $("#elecTable-columns-toggle").button();
    $( "#elecTable-columns-toggle" ).on( "click", function() {
        $( "#columnEditoDialog" ).dialog( "open" );
        elecTable.createColumnUpdateDialog();
    });

    // Update column definitions
    $("#columnEditoDialog").dialog({
        resizable: true,
        autoOpen: false,
        width: 700,
        height: 500,
        modal: true,
        buttons: {
            "Update": function() {
                elecTable.updateColumnSettings();
                $( this ).dialog( "close" );
                console.log('WOOHOO! It worked!');
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            console.log('Closed!');
        }
    });

    // Update individual elecs
    $("#selectedEditorDialog").dialog({
        resizable: true,
        autoOpen: false,
        width: 700,
        height: 500,
        modal: true,
        buttons: {
            "Update": function() {
                elecTable.updateSelectedElecs();
                //elecTable.updateColumnSettings();
                $( this ).dialog( "close" );
                console.log('WOOHOO! It worked!');
            },
            Cancel: function() {
                $( this ).dialog( "close" );
            }
        },
        close: function() {
            console.log('Closed!');
        }
    });

    //#endregion

    //#region Handling electrode objects
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
                    elecTable.setupElecRow(elecObj);
                })
                return parsedText;
            })
            .then(function (elecData) {
                elecTable.createElecTable(elecData);
            })
            .catch(function (error) {
                window.console.log('oops... something went wrong...');
                window.console.log(error);
            })
        );
    }

    // Parse electrodes csv file
    function parseElecCsv(idx, files, table) {
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
                
                // Convert the csv file to a json formatted style
                const parsedData = rawText.split("\n");
                let colNames = parsedData[0].split(",");

                // Remove any blank columns
                let rmvCols = true;
                while (rmvCols) {
                    if (colNames[colNames.length-1] === "") {
                        colNames.pop();
                    } else {
                        rmvCols = false;
                    }
                }

                // Remove any trailing whitespaces from column names and set to lowercase
                for (c=0; c<colNames.length; c++) {
                    colNames[c] = colNames[c].toLocaleLowerCase().trim();
                }

                let numCols = colNames.length;
                let tableData = [];

                // Go through each row
                const tLength = parsedData.length;
                for (ii=1;ii<tLength;ii++) {
                    if (parsedData[ii].length == 0) {continue;}
                    let rowData = {};
                    let rawRow = parsedData[ii].split(",");

                    // Add a new field for each column
                    for (cii=0;cii<numCols;cii++) {
                        rowData[colNames[cii]] = rawRow[cii];
                    }

                    // Add gridid
                    let elecid = rowData['elecid'];
                    rowData['gridid'] = elecid.replace(/\d+/,"");

                    // Add coords
                    rowData["coords"] = [].concat(
                        parseFloat(rowData['x']),
                        parseFloat(rowData['y']),
                        parseFloat(rowData['z'])
                        );

                    tableData.push(elecTable.setupElecRow(rowData));

                }

                return tableData;
            })
            .then(function (elecData) {
                elecTable.createElecTable(elecData);
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

    // Create the 2D scene for the slice
    function createPlaneScene(planesc,ax,domID) {
        let div2d = document.getElementById(domID);
        let renderer2d = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer2d.setSize(div2d.offsetWidth, div2d.offsetHeight);
        renderer2d.setClearColor(0x000000, 1);
        renderer2d.setPixelRatio(window.devicePixelRatio);
        div2d.appendChild(renderer2d.domElement);

        // Create position for line of camerapole
        let lineEnd;
        const camDist = 200;
        switch (ax) {
            case 'Saggital':
                lineEnd = new THREE.Vector3( camDist, 0, 0 );
                break;
            case 'Coronal':
                lineEnd = new THREE.Vector3( 0, camDist, 0 );
                break;
            case 'Axial':
                lineEnd = new THREE.Vector3( 0, 0, camDist );
                break;
        }

        // Pole to mount camera
        let material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
        let points = [];
        points.push(lineEnd);
        points.push( new THREE.Vector3( 0, 0, 0 ) );
        let geometry = new THREE.BufferGeometry().setFromPoints( points );
        line = new THREE.Line( geometry, material );
        line.visible = false; // Helpful in debugging cameras

        // The camera
        let camera = new AMI.OrthographicCamera(
            renderer2d.domElement.clientWidth / -2,
            renderer2d.domElement.clientWidth / 2,
            renderer2d.domElement.clientHeight / 2,
            renderer2d.domElement.clientHeight / -2,
            1,
            1000
            );
        camera.position.copy(points[0]);
        //camera.invertRows();
        line.add(camera);
        camera.position.copy(points[0]);
        camera.lookAt(0,0,0);
        planesc.add(line);

        switch (ax) {
            case 'Saggital':
                camera.rotateZ(Math.PI/2);
                break;
            case 'Coronal':
                camera.rotateZ(Math.PI);
                break;
            case 'Axial':
                lineEnd = new THREE.Vector3( 0, 0, camDist );
                break;
        }

        // Add to global object
        sc.scenes[ax].camera = camera;
        sc.scenes[ax].renderer = renderer2d;
        sc.scenes[ax].scene = planesc;

        // Render function
        function div2dAnimate () {
            //controls.update();
            renderer2d.render(planesc, camera);
        
            requestAnimationFrame(function () {
                div2dAnimate();
            });
        }
        div2dAnimate();
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
                        'pos': 'y',
                        'dom': "plane-coronal"
                    },
                    'Saggital': {
                        'ori': 1,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x00ff00,
                        'axes': ['y', 'z'],
                        'pos': 'x',
                        'dom': "plane-saggital"
                    },
                    'Axial': {
                        'ori': 2,
                        'obj': new AMI.StackHelper(stackT1),
                        'color': 0x0000ff,
                        'axes': ['x', 'y'],
                        'pos': 'z',
                        'dom': "plane-axial"
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

                    // Create 2D plane scene
                    //if (plane === 'Axial') {
                        createPlaneScene(newScene,plane,orients[plane]['dom']);
                    //}
                    
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
        aes.initLegend();

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
            }else if (_fext === "csv") {
                parseElecCsv(i, e.target.files); //parse as electrodes csv file
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

    //#region How to initiate the whole program
    $("#chng-view3").trigger("click"); // Start in view1
    //#endregion

});