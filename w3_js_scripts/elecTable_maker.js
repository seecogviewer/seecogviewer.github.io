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
            } else {
                alert('Unknown file type!');
            }
        }

    })

    //#region Tabulator

    //Row menu for when right-clicking tabulator table
    var rowMenu = [{
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
            label: "<i class='fa fa-edit'></i> Group By Electrode",
            action: function (e, row) {
                row.getTable().setGroupBy('gridid');
            }
        },
        {
            label: "<i class='fa fa-edit'></i> No Grouping",
            action: function (e, row) {
                row.getTable().setGroupBy('');
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

                        var rowData = row.getData();
                        // Check if this object was already drawn, if it was then delete it and redraw it
                        if (scene.getObjectByName(rowData.elecid) != null) {
                            const prevObj = scene.getObjectByName(rowData.elecid);
                            //debugger;

                            // Also check if it has any text children
                            if (prevObj.children.length !== 0) {
                                prevObj.children.forEach(function (child) {
                                    if (threeTextObjs.includes(child.id)) {
                                        threeTextObjs.splice(threeTextObjs.indexOf(child.id), 1);
                                    }
                                })
                            }

                            // Remove the object from the scene
                            scene.remove(prevObj);
                        }

                        // Determine elec shapes
                        var elecGeom;

                        //debugger;
                        if (rowData.soz == 1 && rowData.spikey == 1) {
                            elecGeom = new THREE.BoxBufferGeometry(2, 2, 2);
                        } else if (rowData.soz == 1) {
                            elecGeom = new THREE.TetrahedronBufferGeometry(2, 0);
                        } else if (rowData.spikey == 1) {
                            //elecGeom = new THREE.CylinderBufferGeometry(2, 2, 2, 30);
                            elecGeom = new THREE.DodecahedronBufferGeometry(2, 0);
                        } else {
                            elecGeom = new THREE.SphereBufferGeometry(1, 32, 32);
                        }

                        // Determine elec color based on associated function
                        let elecColor;
                        if (rowData.motor) {
                            elecColor = elecSettings.functional.motor;
                        } else if (rowData.sensory) {
                            elecColor = elecSettings.functional.sensory;
                        } else if (rowData.visual) {
                            elecColor = elecSettings.functional.visual;
                        } else if (rowData.visual) {
                            elecColor = elecSettings.functional.visual;
                        } else if (rowData.auditory) {
                            elecColor = elecSettings.functional.auditory;
                        } else if (rowData.language) {
                            elecColor = elecSettings.functional.language;
                        } else {
                            elecColor = elecSettings.functional.none;
                        }

                        const coords = rowData.lepto;
                        //const elecShpere = new THREE.SphereBufferGeometry(2, 32, 32);
                        const material = new THREE.MeshLambertMaterial({
                            color: elecColor //rowData.color
                        });
                        //debugger;
                        const elecMesh = new THREE.Mesh(elecGeom, material);
                        elecMesh.position.x = coords[0];
                        elecMesh.position.y = coords[1];
                        elecMesh.position.z = coords[2];
                        elecMesh.name = rowData.elecid;
                        const RASToLPS = new THREE.Matrix4();
                        scene.add(elecMesh);
                        addText2Scene(elecMesh.name, elecMesh);
                    }

                    if (document.getElementById('elecSlideshow').style.display !== 'none' && row.getData().hasOwnProperty('PICS')) {
                        let picsData = row.getData().PICS;
                        if (picsData !== 'NaN') {
                            let newImage = document.createElement("IMG");
                            newImage.src = picsData;
                            newImage.className = 'ElecSlice';
                            newImage.classList.add('w3-display-center');
                            document.getElementById("elecSlideshow").appendChild(newImage);

                            // Check if need to toggle the slide buttons being disabled
                            if (document.getElementsByClassName('slidebttn')[0].classList.contains('w3-disabled')) {
                                document.getElementsByClassName('slidebttn')[0].classList.remove("w3-disabled");
                                document.getElementsByClassName('slidebttn')[1].classList.remove("w3-disabled");
                                document.getElementsByClassName('slidebttn')[0].disabled = false;
                                document.getElementsByClassName('slidebttn')[1].disabled = false;
                                let eSlices = document.getElementsByClassName("ElecSlice");
                                eSlices[0].style.display = 'block';
                                slideIndex = 1;
                            }

                            // Embedded function. If shift + left-click pressed, image dissappears
                            newImage.onclick = function (event) {
                                if (event.shiftKey) {
                                    newImage.remove()

                                    // Do we need to disable the buttons for slideshow?
                                    if (document.getElementsByClassName("ElecSlice").length === 0) {
                                        document.getElementsByClassName('slidebttn')[0].classList.add("w3-disabled");
                                        document.getElementsByClassName('slidebttn')[1].classList.add("w3-disabled");
                                        document.getElementsByClassName('slidebttn')[0].disabled = true;
                                        document.getElementsByClassName('slidebttn')[1].disabled = true;
                                    } else {
                                        plusDivs(-1);
                                    }
                                }
                            }
                        }
                    }
                })
            },
        }
    ]

    // Create a new tabulator style table
    elecTable = new Tabulator("#elecTable", {
        //data: tabulatorData,
        placeholder: "Waiting for electrode json file",
        //layout:"fitColumns",
        layout: "fitData",
        height: "50%",
        resizableColumns: true,
        selectablePersistence: false,
        columnMinWidth: 10,
        //maxHeight: "70%",
        //dataTree: true, // Data tree view allowing dropdowns and children elements
        //movableRows:true, // Can drag rows
        rowContextMenu: rowMenu,
        selectable: true,
        groupDblClick: function (e, group) {
            //debugger;
            group.getRows().forEach(function (row) {
                row.toggleSelect();
            })
        },
        groupBy: ["gridid"],
        groupStartOpen: [false],
        columns: [
            {
                title: "elecID",
                field: "elecid",
                visible: true,
                headerFilter: "input",
                editable: false
            },
            {
                title: "SOZ",
                field: "soz",
                formatter: "tickCross",
                editable: false,
                editor: true
            },
            {
                title: "SPIKEY",
                field: "spikey",
                formatter: "tickCross",
                editable: false,
                editor: true,
            },
            {
                title: "Anat",
                field: "anat",
                editable: false,
                headerFilter: "input"
            },
            {
                title: "Motor",
                field: "motor",
                formatter: "tickCross",
                editable: false,
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
                editable: false,
                editor: true
            },
            {
                title: "Auditory",
                field: "auditory",
                formatter: "tickCross",
                editable: false,
                editor: true
            },
            {
                title: "Language",
                field: "language",
                formatter: "tickCross",
                editable: false,
                editor: true
            },
        ],
    });

    //#endregion


    // Button on dialogue box that will display electrodes entered
    document.getElementById("chosenElecsEnter").addEventListener("click", function selectElecs() {
        let inputTxt = document.getElementById("chosenElecs").value;
        inputTxt.split(',').forEach(function (inputii) {
            let possibleRows = elecTable.searchRows("elecid", "like", inputii);
            if (possibleRows.length === 1) {
                possibleRows[0].select();
            } else if (possibleRows.length > 1) {
                const eids = possibleRows.map(function (e) {
                    return e.getData().elecid.toUpperCase()
                });
                const eIdx = eids.indexOf(inputii.toUpperCase());
                possibleRows[eIdx].select();
            } else {
                console.log("Error, couldn't find " + inputii + " in the table");
            }
        });
        document.getElementById('elecSelector').style.display = 'none';
    });

    // Button for creating dialogue that allows electrode selection
    document.getElementById('selectElecs').addEventListener('click',function() {
        if (! this.classList.contains('w3-disabled')) {
            document.getElementById('elecSelector').style.display='block';
        }
    });


    document.getElementById('clearElecsBttn').addEventListener('click', function clearAllElecs() {
        // Get rid of all the electrodes in 3D view first
        if (threeTextObjs.length > 0) {
            threeTextObjs.forEach(function (textid) {
                scene.remove(scene.getObjectById(textid).parent);
            })
            threeTextObjs = [];
        }
        // Get rid of static images
        let eSliceElems = document.getElementsByClassName('ElecSlice');
        let numSlices = eSliceElems.length;
        if (numSlices > 0) {
            for (let i = 0; i < numSlices; i++) {
                eSliceElems[0].remove()
                // Do we need to disable the buttons for slideshow?
                if (document.getElementsByClassName("ElecSlice").length === 0) {
                    document.getElementsByClassName('slidebttn')[0].classList.add("w3-disabled");
                    document.getElementsByClassName('slidebttn')[1].classList.add("w3-disabled");
                    document.getElementsByClassName('slidebttn')[0].disabled = true;
                    document.getElementsByClassName('slidebttn')[1].disabled = true;
                } else {
                    plusDivs(-1);
                }
            }
        }
    });
})
