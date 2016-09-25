var parseFilename = function (file) {
    var i = file.substring(0, file.lastIndexOf("."));
    
    return i;
};


document.getElementById("submitbutton").onclick = function () {
    var filename = parseFileName(document.getElementById("key").value);
                             
    location.href = "'music1.html?mp3='+filename";
};
