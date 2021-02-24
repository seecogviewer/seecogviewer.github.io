// Types of columns for electrode table
let defaultElecTableColumns = [
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
    }
];

// Menu that appears from right-clickign table
let rowMenu = [{
    label: "<i class='fa fa-edit'></i> Display Selected",
    action: function (e, row) {
        row.getTable().selectRow();
    }
},
{
    label: "<i class='fa fa-edit'></i> Edit Selected",
    action: function (e, row) {
        row.getTable().deselectRow();
    }
}];

// Options for how to initialize table
let tableOpts = {
    placeholder: "Waiting for electrode json file",
    layout: "fitData",
    height: "100%",
    resizableColumns: true,
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
    groupStartOpen: [false]
};

// Create a new tabulator style table
elecTable = new Tabulator("#" + sc.elecTable.domID, tableOpts);