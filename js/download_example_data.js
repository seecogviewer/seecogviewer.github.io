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
        let exmpl_data_bttn = document.createElement("a");
        exmpl_data_bttn.id = "download-example-data";
        exmpl_data_bttn.href = "https://drive.google.com/drive/folders/13Kl4uZoVq66BmoC8k7mOLrp9B8-wdwQT?usp=sharing";//"#load-example-data";
        exmpl_data_bttn.classList.add("w3-bar-item", "w3-button");
        exmpl_data_bttn.innerText = "Download Example Data";
        file_dropdown.append(exmpl_data_bttn);
    }
});