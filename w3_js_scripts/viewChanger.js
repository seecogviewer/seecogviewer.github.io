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


/*window.onload = function() {

    // Start by hiding elements that are not needed
    w3.hide('#elecStatic');
    w3.hide('#planarScenes');
    w3.addStyle('#e,)

}*/


$(document).ready(function () {

    // Change view to show 3D and static images: All 3 Columns
    $("#chng-view1").click(function() {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height","70%");
        $("#elecSlideShow").css("height","30%").show();
        $("#elecStatic").hide();
        $("#scenesArea").css('width', '50%').show();
        $("#threeDviewArea").css("height","100%").show();  
        $("#planarScenes").hide();
    });

    // Change view to show 3D and static images: All 3 Columns
    $("#chng-view2").click(function() {
        $("#planarScenes").hide();
        $("#elecSlideShow").hide();
        $("#elecStatic").css('width', '33.33%').show();
        $("#tableDiv").css('width', '33.33%');
        $("#scenesArea").css('width', '33.33%');
        $("#threeDviewArea").css("height","100%").show();
        $("#elecTable-parent").css("height","100%");
    });

    // Change view to table, 3D and 2D planes
    $("#chng-view3").click(function() {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height","100%");
        $("#elecSlideShow").hide();
        $("#elecStatic").hide();
        $("#scenesArea").css('width', '50%');
        $("#threeDviewArea").css("height","70%").show();
        $("#planarScenes").css("height","30%").show();
    });

    // Change view to table and statics
    $("#chng-view4").click(function() {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height","100%");
        $("#elecSlideShow").hide();
        $("#elecStatic").css('width', '50%').show();
        $("#scenesArea").hide();
    });

    // Start in view1
    $("#chng-view1").trigger("click");

});