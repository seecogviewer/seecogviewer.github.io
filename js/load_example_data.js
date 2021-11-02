/*
Get URL
Method 1: window.location.href
Method 2: document.URL
*/

$(document).ready(function () {

    let isLocal = true;
    let seecogURL = '';

    try {
        seecogURL = window.location.href;
    } catch {
        seecogURL = document.URL;
    }

    isLocal = seecogURL.startsWith('file');

    if (!isLocal) {
        // Add a "Load Example Data" tab
        let file_dropdown = document.getElementById("file-dropdown");
        let load_bttn = document.createElement("a");
        load_bttn.id = "load-example-data";
        load_bttn.href = "https://drive.google.com/drive/folders/13Kl4uZoVq66BmoC8k7mOLrp9B8-wdwQT?usp=sharing";//"#load-example-data";
        load_bttn.classList.add("w3-bar-item", "w3-button");
        load_bttn.innerText = "Load Example Data";
        file_dropdown.append(load_bttn);

        // onclick
        // load_bttn.onclick = function (event) {
        //     event.preventDefault();

        //     let elecFile = "/example_data/electrodes.json";
        //     fetch(elecFile)
        //     .then(function(r) {
        //         return r.json();
        //     })
        //     .then(function(d) {
        //         debugger;
        //         parsers.ElecJson(0, elecFile);
        //     })
        // }
    }
});