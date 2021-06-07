$(document).ready(function () {

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
                    scenery.init3DScene();
                }
                parsers.FSMesh(i, e.target.files);
            } else if (sc.dtypes['electrodes']['extensions'].indexOf(_fext) >= 0) {
                parsers.ElecJson(i, e.target.files); //parse as electrodes json file
            }else if (_fext === "csv") {
                parsers.ElecCsv(i, e.target.files); //parse as electrodes csv file
            } else if (sc.dtypes['volumes']['extensions'].indexOf(_fext) >= 0) {
                if (!init3) {
                    scenery.init3DScene();
                }
                parsers.Volume(i, e.target.files);
            } else if (sc.dtypes['overlay']['extensions'].indexOf(_fext) >= 0) {
                parsers.Overlay(i, e.target.files);
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