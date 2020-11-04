// Click the 2nd view button for three column layout
function changeView(newViewMode) {

    // Adjust what the current view mode is
    document.getElementById('workSpace').classList.remove(currentViewMode);
    document.getElementById('workSpace').classList.add(newViewMode);
    //currentViewMode = newViewMode;


    // Move any existing static images over to the current layout's viewing pane
    /*let existingImgs = document.getElementsByClassName('ElecSlice');
    let newViewPane = document.getElementById(viewModes[newViewMode]['imgPane']);
    let oldViewPane = document.getElementById(viewModes[currentViewMode]['imgPane']);
    for (ii=0;ii<existingImgs.length;ii++) {
        newViewPane.appendChild(existingImgs[ii]);
        existingImgs[ii].remove();
    }*/

    currentViewMode = newViewMode;
}

// Jquery ui resize widget

$(document).ready(function () {
    /*$('#threeDviewArea').resizable({
        //alsoReize: '#threeDviewArea',
        resize: function( event, ui ) {
            const pHeight = event.target.parentNode.clientHeight;
            const pWidth = event.target.parentNode.clientHeight;
            const myHeight = ui.size.height;
            const myWidth = ui.size.width;

            let otherElm = document.getElementById('elecTable-parent');
            $('#elecTable-parent').height(pHeight - myHeight);
            $('#elecTable-parent').width(pWidth - myWidth);

        },
        handles: 'w',
        containment: "parent"
    });*/

    /*
    $('#threeDviewArea').resizable({
        alsoReize: '#elecTable-parent'
    });
    */
});
