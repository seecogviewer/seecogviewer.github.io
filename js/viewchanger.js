$(document).ready(function () {    
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

        // If any static images exist then move them over to the elecStatic element
        imgHolder.activeDOM = 'elecSlideShow';
        let firstel = true;
        for (imgii of imgHolder.imgs) {
            $('#elecSlideShow').append(imgii);
            if (firstel) {
                $(imgii).css('display','block');
                imgHolder.enableSlideShow();
                firstel = false;
            } else {
                $(imgii).hide();
            }
            
        }
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

        // If any static images exist then move them over to the elecStatic element
        imgHolder.activeDOM = 'elecStatic';
        for (imgii of imgHolder.imgs) {
            $('#elecStatic').append(imgii);
            $(imgii).show();
        }
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

        // If any static images exist then move them over to the elecStatic element
        imgHolder.activeDOM = 'elecSlideShow';
        let firstel = true;
        for (imgii of imgHolder.imgs) {
            $('#elecSlideShow').append(imgii);
            if (firstel) {
                $(imgii).css('display','block');
                imgHolder.enableSlideShow();
                firstel = false;
            } else {
                $(imgii).hide();
            }
            
        }
    });

    // Change view to table and statics
    $("#chng-view4").click(function () {
        $("#tableDiv").css('width', '50%');
        $("#elecTable-parent").css("height", "100%");
        $("#elecSlideShow").hide();
        $("#elecStatic").css('width', '50%').show();
        $("#scenesArea").hide();

        // If any static images exist then move them over to the elecStatic element
        imgHolder.activeDOM = 'elecStatic';
        for (imgii of imgHolder.imgs) {
            $('#elecStatic').append(imgii);
            $(imgii).show();
        }
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
});