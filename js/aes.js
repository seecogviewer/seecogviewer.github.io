$(document).ready(function () {

    //#region Aesthetics: Displaying Electrodes
    aes = {
        default: {shape: "sphere", color: "#000000",size: 2}, //aesDefaults,
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
                outcome: {color: "#ff0000", size: 3},
                display: true
            },
            {
                criteria: [{field: "spikey", type: "=",value: true}],
                outcome: {color: "#00ff00", size: 3},
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
                //{title: 'Color', field: 'color', editor: 'select', editorParams: {values: {"default": "default", "red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                
                // Try the color picker here
                // TODO: How to specify "Default" as an option
                // Possibly best way: Make "Close" button into a "Default" button by adding an additional callback for when the button is clicked
                //  Try something like this:
                // $('.jscolor-btn-close').mousedown(
                //     function(){ 
                //         this.onmousedown();
                //         console.log('yay!');
                //     }
                // )
                {
                    titleFormatter: function() {return '<span>Color</span>';},
                    field: 'color',
                    // editor:"select", editorParams:{values:{"default":"default", "custom": "custom"}},
                    formatter: function(cell,formatterParams,onRendered) {

                        onRendered(function(){
                            
                            let picker = new JSColor(document.getElementById('goober2'),{
                                'value': cell.getValue(),
                                'onChange': function() {
                                    let newcolor = document.getElementById('goober2').getAttribute('data-current-color');
                                    cell.getRow().update({'color': newcolor});
                                    debugger;
                                },
                                'closeButton': true,
                                'closeText': 'Default'
                            });
                        });
                        return "<p style='padding: 0; margin: 0; border: 0'><input id='goober2'></p>";
                    }
                },
                {title: 'Size', field: 'size', editor: 'select', editorParams: {values: {"default": "default", "1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3, "3.5": 3.5, "default": "default"} }},
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
            var editorTableDefault;
            editorTableDefault = new Tabulator('#editorTable-default', {
                data: [defaultSettings],
                index: 'field',
                layout:"fitColumns",
                columns: [
                    {title: 'Shape', field: 'shape', editor: 'select', editorParams: {values: {"cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                    //{title: 'Color', field: 'color', editor: 'select', editorParams: {values: {"red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                    // {
                    //     title: 'Color', field: 'color', editable: true,
                    //     formatter: 'color',
                    //     editor: function(cell,onRendered,success,cancel) {
                    //         var inputel, picker;
                    //         /*picker = new JSColor(inputel,{
                    //             value: cell.getValue(),
                    //             hash: true,
                    //             onChange: function() {
                    //                 //debugger;
                    //                 success(this.valueElement.getAttribute('data-current-color'));
                    //             }
                    //         });*/

                    //         function onChange(){
                    //             success(document.getElementById('goober').getAttribute('data-current-color'));
                    //         }

                    //         //inputel.addEventListener("blur", onChange);

                    //         onRendered(function(){
                    //             inputel = document.createElement('INPUT');
                    //             picker = new JSColor(inputel,{
                    //                 value: cell.getValue(),
                    //                 hash: true,
                    //                 onChange: function() {
                    //                     //debugger;
                    //                     success(this.valueElement.getAttribute('data-current-color'));
                    //                 }
                    //             });
                    //             //picker.value = cell.getValue();
                    //             picker.show();
                    //         });
                    //         return inputel;
                    //     }
                    // },
                    {title: 'Size', field: 'size', editor: 'select', editorParams: {values: {"1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3, "3.5": 3.5, "default": "default"} }},

                    // Try the color picker here
                    {
                        titleFormatter: function() {return '<span>Color</span>';},
                        field: 'color',
                        formatter: function(cell,formatterParams,onRendered) {

                            onRendered(function(){
                                
                                var picker = new JSColor(document.getElementById('goober'),{
                                    //'value': cell.getValue(),
                                    //'value': '#' + new THREE.Color(cell.getValue()).getHexString(),
                                    'value': cell.getValue(),
                                    'onChange': function() {
                                        let newcolor = document.getElementById('goober').getAttribute('data-current-color');
                                        //debugger;
                                        cell.getRow().update({'color': newcolor});
                                    },
                                    'closeButton': true,
                                });
                                $('.jscolor-btn-close').children('span').html('Default');
                            });
                            return "<p style='padding: 0; margin: 0; border: 0'><input id='goober'></p>";
                        }
                    }
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
});