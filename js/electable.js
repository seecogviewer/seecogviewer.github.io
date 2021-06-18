var electable;

$(document).ready(function () {
    
    // Prototype eyeball column 1
    let eyeball_column1 = {
        formatter: function (cell, formatterParams, onRendered) {
            onRendered(function () {
                if (cell.getRow().getData()['isVisible'] === true) {
                    //return "<i class=''></i>";
                    $(cell.getElement()).children('i').addClass('fa fa-eye');
                } else {
                    //return "<i class='fa fa-eye'></i>";
                    $(cell.getElement()).children('i').removeClass('fa fa-eye');
                }
            });
            return "<i class=''></i>";
        },
        titleFormatter: function () {
            return "<i class='fa fa-eye'></i>";
        },
        width: 50,
        frozen: true,
        headerSort: false,
        headerMenu: [{
                label: 'Show All',
                action: function (e, column) {
                    console.log('Showing all elecs!');
                    let groupsOpen = [];
                    e.preventDefault();
                    /*elecTable.obj.getGroups().forEach(function(g) {
                        const gIsVisible = g.isVisible();
                        g.show();
                        for (row of g.getRows()) {
                            let notShown = row.getData().scObj.threeObj === null;
                            if (notShown) {
                                elecTable.displayElec(row);
                            }
                        }
                        if (!gIsVisible) {
                            g.hide();
                        }
                    });*/
                    elecTable.obj.getRows().forEach(function (row) {
                        if (row.getData()['isVisible'] === false) {
                            elecTable.displayElec(row);
                            if (row.getCells().length !== 0) {
                                let cell = row.getCells()[0];
                                $(cell.getElement()).children('i').addClass('fa fa-eye');
                            }
                        }
                    });
                }
            },
            {
                label: 'Remove All',
                action: function (e, column) {
                    console.log('Removing all elecs!');
                    let groupsOpen = [];
                    e.preventDefault();
                    elecTable.obj.getRows().forEach(function (row) {
                        if (row.getData()['isVisible'] === true) {
                            elecTable.removeElec(row);
                            if (row.getCells().length !== 0) {
                                let cell = row.getCells()[0];
                                $(cell.getElement()).children('i').removeClass('fa fa-eye');
                            }
                        }
                    });
                }
            },
        ],
        cellClick: function (e, cell) {
            //let isShown3D = cell.getData().scObj.threeObj !== null;
            //const isShownImg = cell.getData().scObj.img !== null;
            let isShown = cell.getRow().getData()['isVisible'];
            let row = cell.getRow();
            if (!isShown) {
                $(cell.getElement()).children('i').addClass('fa fa-eye');
                elecTable.displayElec(row);
            } else {
                $(cell.getElement()).children('i').removeClass('fa fa-eye');
                elecTable.removeElec(row);
            }
        }
    };

    // Eyeball column prototype 2
    let eyeball_column2 = {
        titleFormatter: function () {
            return "<i class='fa fa-eye'></i>";
        },
        field: 'isVisible',
        width: 50,
        frozen: true,
        headerSort: false,
        formatter: "tickCross",
        formatterParams: {
            allowEmpty: false,
            allowTruthy: false,
            tickElement: "<i class='fa fa-eye'></i>",
            crossElement: "<i class='fa'></i>",
        },
        cellClick: function(e,cell) {
            cell.setValue( !cell.getValue() )
            if (cell.getValue()) {
                cell.getRow().getData()['scObj'].show(threed=true,staticImg=true);
            } else {
                cell.getRow().getData()['scObj'].hide();
            }
        },
        headerMenu: [{
                label: 'Show All',
                action: function (e, column) {
                    console.log('Showing all elecs!');
                    let groupsOpen = [];
                    e.preventDefault();
                    elecTable.obj.getRows().forEach(function (row) {
                        if (row.getData()['isVisible'] === false) {
                            row.getData()['scObj'].show(threed=true,staticImg=true);
                        }
                    });
                }
            },
            {
                label: 'Remove All',
                action: function (e, column) {
                    console.log('Removing all elecs!');
                    let groupsOpen = [];
                    e.preventDefault();
                    elecTable.obj.getRows().forEach(function (row) {
                        if (row.getData()['isVisible'] === true) {
                            row.getData()['scObj'].hide();
                        }
                    });
                }
            },
        ],
    };
    
    //#region elecTable object and associated buttons

    // Function for checking if cells can be edited or not on click
    function check2update(e,cell) {
        if (document.getElementById("bttns-editmode").checked) {
            cell.setValue( !cell.getValue() );
        }
    }

    // Recursively go through electable and select rows, not groups
    function recurseRowSelect(e,group) {
        let groupRows = group.getRows();
        if (groupRows.length === 0) {
            let subgroups = group.getSubGroups();
            for (grp of subgroups) {
                recurseRowSelect('e',grp);
            }
        } else {
            for (r of groupRows) {
                r.select();
            }
        }
    }

    // The primary elecTable object
    elecTable = {
        obj: null,
        domID: "elecTableChild",
        groupBy: ['subid','gridid'],
        filters: [],
        filter_table: null,
        tmpColumnUpdate: null,
        tmpSelectedEditor: {'aes': null, 'properties': null},
        selectedUpdatorDialog: function() {

            // Options for colors
            let opts = ["No Change","default",'red','blue','orange','green','yellow','black','purple','aquamarine','chocolate','darkred','deeppink','dodgerblue','fuscia','coral','maroon','magenta','violet','lime','gold','crimson','darkviolet','darkorange'];
            let colordict = {};
            for (c of opts) {colordict[c] = c}

            // Setup Aesthetics editor
            let aesColumns = [
                {title: 'Shape', field: 'shape', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change","default": "default","cube": "cube", "sphere": "sphere", "cone": "cone", "dodecahedron": "dodecahedron", "tetrahedron": "tetrahedron", "octahedron": "octahedron"} }},
                //{title: 'Color', field: 'color', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change", "default": "default", "red": "red", "blue": "blue", "green": "green", "black": "black", "yellow": "yellow", "purple": "purple"} }},
                {title: 'Color', field: 'color', headerSort: false, editor: 'select', editorParams: {values: colordict }},
                {title: 'Size', field: 'size', headerSort: false, editor: 'select', editorParams: {values: {"No Change": "No Change", "default": "default", "1": 1, "1.5": 1.5, "2": 2, "2.5": 2.5, "3": 3, "3.5": 3.5, "default": "default"} }},
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
                if (c.field === 'anat' || c.field === 'gridid' || c.field === 'subid' || c.field === 'fullname') { continue;}                
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
            eyeball_column2,
            {
                title: "Label",
                field: "elecid",
                visible: true,
                headerFilter: "input",
                /*headerFilterFunc: function(headerValue,rowValue,rowData,filterParams) {

                    if (headerValue != "") {
                        debugger;
                        var re = new RegExp(headerValue,'i');
                        let searcher = rowValue.match(re);
                        return searcher[0] != "";
                    }
                },*/
                editable: false,
                frozen: true,
            },
            {
                title: 'Subject',
                field: 'subid',
                visible: false,
                editable: false
            },
            {
                title: 'gridID',
                field: 'gridid',
                visible: false,
                editable: false
            },
            {
                title: 'FullID',
                field: 'fullname',
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
        createRowMenu: function (component, e) {
            let menu = [{
                label: "<i class='fa fa-edit'></i> Edit Selected",
                action: function (e, row) {
                    //row.getTable().selectRow();
                    //console.log('Editing!');
                    $("#selectedEditorDialog").dialog("open");
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
            },
            {
                separator: true
            }
            ];

            let surfsMenu = [];

            // Go through each available surface
            let surfs = Object.keys(sc.datGui.objs['surf'].__folders);
            let numSurfs = surfs.length;
            let ii;
            for (ii=0;ii<numSurfs;ii++) {
            //for (s of surfs) {
                let s = surfs[ii];
                //debugger;
                surfsMenu.push({
                    label: s,
                    action: function (e, row) {
                        //row.getTable().selectRow();
                        e.preventDefault();
                        //let mesh = sc.scenes.threeD.scene.getObjectByName(s);
                        let selectedRows = row.getTable().getSelectedRows();
                        selectedRows.forEach(function (rowX) {
                            //rowX.getData()['scObj'].snap2surf(mesh);
                            rowX.getData()['scObj'].snap2surf(s);
                            //elecTable.displayElec(rowX);
                        });
                    }
                });
            }

            menu.push({
                label: "<i class='fa fa-share'></i> Snap To Surface <i class='fa fa-caret-right'></i>",
                menu: surfsMenu
            });

            return menu;
        },
        createElecTable: function(inputData) {
            let t = new Tabulator('#elecTable', {
                placeholder: "Waiting for electrode json file",
                data: inputData,
                layout: "fitData",
                index: "fullname",
                //index: "elecid",
                //height: "100%",
                resizableColumns: true,
                movableColumns: true,
                groupHeader: function(value,count,data,group) {
                    return group.getField().toUpperCase() + ' - ' + value + "<span class='row-hdr-span' style='color:#000; margin-left:10px; margin-right:10px; font-weight: 100; font-size: 12px;'>- " + count + " Electrodes</span>";
                },
                groupContextMenu: [
                    {
                        label: "Select All",
                        /*action: function(e,group) {
                            group.getRows().forEach(function(r) {r.select();})
                        }*/
                        action: recurseRowSelect
                    },
                    {
                        label: "Unselect All",
                        action: function(e,group) {
                            group.getRows().forEach(function(r) {r.deselect();})
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
                rowContextMenu: this.createRowMenu,//this.rowMenu,
                selectable: true,
                groupDblClick: function (e, group) {
                    group.getRows().forEach(function (row) {
                        row.toggleSelect();
                    })
                },
                groupBy: this.groupBy,
                groupStartOpen: [false,false],
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

            // Include subject ID
            if ( !elecData.hasOwnProperty('subid') ) {
                elecData['subid'] = 'sub001';
            }

            // Create the "full name"
            elecData['fullname'] = elecData['subid'] + '-' + elecData['elecid'];

            // Add aesthetic fields
            const aesFields = ['shape', 'color', 'size'];
            for (field of aesFields) {
                if (!elecData.hasOwnProperty(field)) {
                    elecData[field] = "default";
                }
            }

            // Add visibility field
            elecData['isVisible'] = false;

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
            //let rowID = elecData.getData()['elecid'];
            let rowID = elecData.getData()['fullname'];
            //let eyeCell = elecData.getCells()[0];
            /*if (eyeCell === undefined) {
                debugger;
            }*/
            scObj.init(threed,staticImg);
            if (true) {
                if (sc.elecScene.getObjectByName(rowID) === undefined) {
                    sc.elecScene.add(scObj.threeObj);
                    elecData.update({'isVisible': true});
                    //$(eyeCell.getElement()).children('i').addClass('fa fa-eye');
                    //debugger;
                    //$(elecData.getCells()[0].getElement()).children('i').addClass('fa fa-eye');
                } else {
                    scObj.update();
                }
            }
            if (staticImg && scObj.img === null && elecData.getData()['PICS'] !== "") {
                let imgDOM = imgHolder.appendImg(elecData.getData()['PICS'],rowID + '-img');
                
                //elecImg.onclick = function (event) {
                imgDOM.onclick = function (event) {
                    if (event.shiftKey) {
                        //imgHolder.imgs.splice(this._slideShowIndex,1);
                        
                        //scObj.removeElec(elecData);
                        elecTable.removeElec(elecData);

                        //imgDOM.remove();
                        elecData.update({'img': null});
                        //if ($('#elecSlideShow').is(':hidden') === false) {
                       //     imgHolder.nextSlide(-1);
                        //}
                    }
                }
                scObj.img = imgDOM;
            }
        },
        removeElec: function(elecData) {
            let scObj = elecData.getData()['scObj'];
            let rowID = elecData.getData()['fullname'];
            let imgDOM = document.getElementById(rowID + '-img');
            const threeDVisible = document.getElementById("scenesArea").style.display !== "none";
            let eyeCell = elecData.getCells()[0];
            // If object is visible in 3D scene, remove it
            if (scObj.threeObj !== null || imgDOM !== null) {
                scObj.destroyObj();
                
                if (imgDOM !== null) {
                    imgDOM.remove();
                    if (imgHolder._slideShowEnabled) {
                        imgHolder.nextSlide(-1);
                    }
                }
                //$(eyeCell.getElement()).children('i').removeClass('fa fa-eye');
            }
    
            // If object is visible in static image scene, delete it
            if (scObj.img !== null) {
                scObj.destroyImg();
            }

            elecData.update({'isVisible': false});
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
            let newRow, isGrouped;
            columnDefs.forEach(function(c) {
                //isGrouped = c['field'].indexOf(elecTable.groupBy) !== -1 ? true: false;
                isGrouped = elecTable.groupBy.includes(c['field']);
                newRow = {'column': c.title, 'fieldname': c.field, 'isVisible': c.visible, 'groupBy': isGrouped, 'filter': ""};
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
        update_filters: function() {

            // Get filter table
            let filter_table = this.filter_table;
            let t_rows = filter_table.getRows();

            // Reformat row components to be usable as filters for tabulator
            let new_filters = [];
            let data, field, ftype, val;
            for (r of t_rows) {
                data = r.getData();
                rfield = data['property'];
                ftype = data['filter'] === 'unlike' ? '!=' : data['filter'];
                val = data['inputValue'];

                // Check to see if the input value is of boolean type
                let true_vals = ['yes','true'];
                let false_vals = ['no','false'];
                if (true_vals.includes(val.toLowerCase())) {
                    val = true;
                } else if (false_vals.includes(val.toLowerCase())) {
                    val = false;
                }

                new_filters.push({field: rfield, type: ftype, value: val});
            }
            this.obj.setFilter(new_filters);
            this.filters = new_filters;

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

    // Search dialogue
    $("#searchDialog").dialog({
        resizable: true,
        autoOpen: false,
        width: 700,
        height: 500,
        modal: true,
        buttons: {
            "Search": function() {
                console.log('not yet');
                elecTable.update_filters();
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
    
    $( "#bttns-search" ).on( "click", function() {
        if (elecTable.obj !== null) {
            $( "#searchDialog" ).dialog( "open" );

            // Columns that can be selected to filter for
            let cols = elecTable.obj.getColumns();
            //let validCols = [];
            let validCols = {};
            for (c of cols) {
                if (c.getDefinition()['title']) {
                    //validCols.push({[c.getField()]: c.getDefinition()['title']});
                    //validCols[[c.getField()]] = c.getDefinition()['title'];
                    validCols[c.getDefinition()['title']] = c.getDefinition()['title'];
                }
            }

            // Get current filters
            let current_filters = elecTable.filters;

            // Options for filtering values
            let searchFilters = ["=",">","<","<=",">=","like","unlike"];
            let searchFiltersObj = {};
            for (v of searchFilters) {searchFiltersObj[`${v}`]=v};

            // Set data variable
            let idNum = 1;
            current_filters.forEach(function(f) {
                f['id'] = idNum;
                idNum += 1;
            });

            // Create the table for filters
            let searchTable = new Tabulator('#searchEditor', {
                //data: [{id: idNum}],
                data: current_filters,
                index: "id",
                layout: "fitColumns",
                columns: [
                    {
                        formatter: function() {return "<i class='fas fa-minus-circle'></i>";},
                        width: 30,
                        cellClick: function(e,cell) {
                            cell.getRow().delete();
                        }
                    },
                    {title: 'Property', field: 'property', editor: 'select', editorParams: {values: validCols }},
                    {title: 'Filter', field: 'filter', editor: 'select', editorParams: {values: searchFiltersObj }},
                    {title: 'Value', field: 'inputValue', editor: 'input'},
                ],
                columnMinWidth: 60
            });
            elecTable.filter_table = searchTable;

            // Button to add additional filter
            $("#add-filter-bttn").button();
            $( "#add-filter-bttn" ).on( "click", function() {
                idNum += 1;
                searchTable.addRow({id: idNum});
            });
        }
    });
    

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
        $( "#columnEditorDialog" ).dialog( "open" );
        elecTable.createColumnUpdateDialog();
    });

    // Update column definitions
    $("#columnEditorDialog").dialog({
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
            "New Column": function () {
                elecTable.obj.addColumn({title: 'New',field: 'new'},false)
                .then(function() {
                    debugger;
                    let rows = elecTable.obj.getRows();
                    rows.forEach(function(r) {
                        r.update({"new": "defaultVal"});
                    });
                });
                console.log('Not yet');
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

});