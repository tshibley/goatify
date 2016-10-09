var parseFileName = function (file) {
    var i = file.substring(0, file.lastIndexOf("."));
    i = i.replace(/[^a-zA-Z0-9]/g, '');
    return i;
};


document.getElementById("submitbutton").onclick = function () {
    var filename = parseFileName(document.getElementById("midibutton").files[0].name);
    document.getElementById("midibutton").files[0].name = filename + ".mid"
    console.log(filename); 
    console.log(document.getElementById("midibutton").files[0].name);
    setTimeout( function() { location.href = "music.html?mp3=" + filename; }, 1000); 
                             
};
