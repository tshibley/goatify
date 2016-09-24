// this function from jasmid's demo page
function loadRemote(path, callback) {
    var fetch = new XMLHttpRequest();
    fetch.open('GET', path);
    fetch.overrideMimeType("text/plain; charset=x-user-defined");
    fetch.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            /* munge response into a binary string */
            var t = this.responseText || "";
            var ff = [];
            var mx = t.length;
            var scc = String.fromCharCode;
            for (var z = 0; z < mx; z++) {
                ff[z] = scc(t.charCodeAt(z) & 255);
            }
            callback(ff.join(""));
        }
    };
    fetch.send();
}
window.addEventListener('load', function (event) {
    MIDI.loader = new sketch.ui.Timer;
    MIDI.loadPlugin({
        soundfontUrl: "./soundfont/",
        onprogress: function (state, progress) {
            MIDI.loader.setValue(progress * 100);
        },
        onsuccess: function () {
            /// this sets up the MIDI.Player and gets things goingmidi.
            var player = MIDI.Player;
            player.addListener(function (data) {
                console.log(data);
                document.body.style.backgroundColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
                // NOTE_OFF = 128
                // NOTE_ON  = 144
                // note = data[]
                // if message is NOTE_ON
                // 	@keyboard.press(note)
                // 	@particles.createParticles(note)
                // else if message is NOTE_OFF
                // 	@keyboard.release(note)
            });
            player.timeWarp = 1; // speed the song is played back
            player.loadFile('music/mapleaf.mid', player.start);
        }
    });
});
//# sourceMappingURL=app.js.map