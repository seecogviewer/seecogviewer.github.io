$(document).ready(function () {

            // Add listener to fileinput button so that electrode json file and meshes will be parsed
            $("#load-bttn").change(function (e) {

                // Bin the input files based on file extension
                for (i = 0; i < e.target.files.length; i++) {

                    // Get basic params of this file
                    var _fname = e.target.files[i].name;
                    var _fext = _fname.split('.').pop().toLowerCase();

                    var reader = new FileReader();

                    // Decide what kind of file it is and how to load it
                    if (dtypes['FSmesh']['extensions'].indexOf(_fext) >= 0) {
                        if (!viewer_3d.on) {
                            viewer_3d_init();
                        }
                        //files2Open.push(parseFSMesh(i, e.target.files));
                        //files2Open.push(parseFSMesh(i, e.target.files,elem,scene,meshFolder));
                        parseFSMesh(i, e.target.files, threeD, scene);
                    } else if (dtypes['electrodes']['extensions'].indexOf(_fext) >= 0) {
                        parseElecJson(i, e.target.files, elecTable); //parse as electrodes json file
                    } else if (dtypes['STL']['extensions'].indexOf(_fext) >= 0) {
                        if (!viewer_3d.on) {
                            viewer_3d_init();
                        }
                        parseSTL(i, e.target.files, threeD, scene); //STL files
                    } else if (dtypes['volumes']['extensions'].indexOf(_fext) >= 0) {
                        if (!viewer_3d.on) {
                            viewer_3d_init();
                        }
                        parseVolume(i, e.target.files, threeD, scene);
                    } else {
                        alert('Unknown file type!');
                    }
                }

            })

            //#region Tabulator

            //Row menu for when right-clicking tabulator table
            var rowMenu = [
                {
                    label: "<i class='fa fa-edit'></i> Select All",
                    action: function (e, row) {
                        row.getTable().selectRow();
                    }
                },
                {
                    label: "<i class='fa fa-edit'></i> Deselect All",
                    action: function (e, row) {
                        row.getTable().deselectRow();
                    }
                },
                {
                    label: "<i class='fa fa-search'></i> Display Selected Data",
                    action: function (e, row) {
                        e.preventDefault();
                        let selectedRows = row.getTable().getSelectedRows();
                        selectedRows.forEach(function (row) {
                            //debugger;

                            if (scene != null) {
                                //debugger;

                                // Determine elec shapes
                                var elecGeom;
                                var rowData = row.getData();
                                //debugger;
                                if (rowData.soz == 1 && rowData.spikey == 1) {
                                    elecGeom = new THREE.BoxBufferGeometry(2, 2, 2);
                                } else if (rowData.soz == 1) {
                                    elecGeom = new THREE.TetrahedronBufferGeometry(2,0);
                                } else if (rowData.spikey == 1) {
                                    //elecGeom = new THREE.CylinderBufferGeometry(2, 2, 2, 30);
                                    elecGeom = new THREE.DodecahedronBufferGeometry(2, 0);
                                } else {
                                    elecGeom = new THREE.SphereBufferGeometry(2, 32, 32);
                                }
                                //debugger;

                                // Determine elec color
                                randNum = Math.floor((Math.random() * 20) + 1);
                                var elecColor;
                                if (randNum == 1) {
                                    elecColor = elecSettings.functional.motor;
                                } else if (randNum == 2) {
                                    elecColor = elecSettings.functional.sensory;
                                } else if (randNum == 3) {
                                    elecColor = elecSettings.functional.visual;
                                } else if (randNum == 4) {
                                    elecColor = elecSettings.functional.auditory;
                                } else if (randNum == 5) {
                                    elecColor = elecSettings.functional.language;
                                } else {
                                    elecColor = elecSettings.functional.none;
                                }

                                const coords = rowData.lepto;
                                //const elecShpere = new THREE.SphereBufferGeometry(2, 32, 32);
                                const material = new THREE.MeshLambertMaterial({
                                    color: elecColor//rowData.color
                                });
                                //debugger;
                                const elecMesh = new THREE.Mesh(elecGeom, material);
                                elecMesh.position.x = coords[0];
                                elecMesh.position.y = coords[1];
                                elecMesh.position.z = coords[2];
                                elecMesh.name = rowData.elecid;
                                const RASToLPS = new THREE.Matrix4();
                                scene.add(elecMesh);
                            }

                            if (document.getElementById('staticViewArea').style.display !== 'none' && row.getData().hasOwnProperty('PICS')) {
                                let picsData = row.getData().PICS;
                                if (picsData !== 'NaN') {
                                    let newImage = document.createElement("IMG");
                                    newImage.src = picsData;
                                    newImage.className = 'ElecSlice';
                                    document.getElementById("staticViewArea").appendChild(newImage);
                                    // Embedded function. If shift + left-click pressed, image dissappears
                                    newImage.onclick = function (event) {
                                        if (event.shiftKey) {
                                            newImage.remove()
                                        }
                                    }
                                }
                            }
                        })
                    },
                }]

                // Create a new tabulator style table
                elecTable = new Tabulator("#elecTable", {
                    //data: tabulatorData,
                    placeholder: "Waiting for electrode json file",
                    //layout:"fitColumns",
                    layout: "fitColumns",
                    height: "98%",
                    //maxHeight: "70%",
                    //dataTree: true, // Data tree view allowing dropdowns and children elements
                    //movableRows:true, // Can drag rows
                    rowContextMenu: rowMenu,
                    selectable: true,
                    groupBy: ["subid", "gridid"],
                    groupStartOpen: [true, true],
                    columns: [{
                            title: "General",
                            columns: [ // The 2 below previously had aditional param froze: true
                                {
                                    title: "SubID",
                                    field: "subid",
                                    visible: true,
                                    headerFilter: "input",
                                    editable: false
                                },
                                {
                                    title: "elecID",
                                    field: "elecid",
                                    visible: true,
                                    headerFilter: "input",
                                    editable: false
                                },
                            ]
                        },
                        {
                            title: "Semiology",
                            columns: [{
                                    title: "SOZ",
                                    field: "soz",
                                    formatter: "tickCross",
                                    editable: false,
                                    editor: "select",
                                    editorParams: {
                                        values: {
                                            true: true,
                                            false: false
                                        }
                                    },
                                    headerFilter: true,
                                    headerFilterParams: {
                                        values: {
                                            true: true,
                                            false: false
                                        }
                                    }
                                },
                                {
                                    title: "SPIKEY",
                                    field: "spikey",
                                    formatter: "tickCross",
                                    editable: false,
                                    editor: "select",
                                    editorParams: {
                                        values: {
                                            true: true,
                                            false: false
                                        }
                                    },
                                    headerFilter: true,
                                    headerFilterParams: {
                                        values: {
                                            true: true,
                                            false: false
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            title: "Anat",
                            field: "anat",
                            editable: false,
                            headerFilter: "input"
                        }
                    ],
                });

                //#endregion

            })
