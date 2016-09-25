/* *
 * audio visualizer with html5 audio element
 *
 * adapted for goatify.me
 *
 * v0.1.0
 *
 * licenced under the MIT license
 *
 * see related repos:
 * - HTML5_Audio_Visualizer https://github.com/wayou/HTML5_Audio_Visualizer
 * - 3D_Audio_Spectrum_VIsualizer https://github.com/wayou/3D_Audio_Spectrum_VIsualizer
 * - selected https://github.com/wayou/selected
 * - MeowmeowPlayer https://github.com/wayou/MeowmeowPlayer
 *
 * reference: http://www.patrick-wied.at/blog/how-to-create-audio-visualizations-with-javascript-html
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

window.onload = function() {
    (function() {
      var canvas = document.createElement('canvas');
      canvas.id = 'background';
      document.body.appendChild(canvas);
      var width = canvas.width = window.innerWidth;
      var height = canvas.height = window.innerHeight;
      var ctx = canvas.getContext('2d');

      var pi = Math.PI;
      var R = Math.max(width,height)/2+100, TR = 9, r = R, Tr = 13, cx = width/2, cy = height/2, h = 0;

      function draw() {
          var t = 0;
          ctx.fillRect(0, 0, width, height);
          var init_h = h;
          while(t < TR*Tr*pi) {
              ctx.beginPath();
              ctx.strokeStyle = 'hsla(' + Math.round(h) + ',100%, 50%, .1)';
              ctx.moveTo(cx + R*Math.cos(2/TR*t), cy - R*Math.sin(2/TR*t));
              ctx.lineTo(cx + r*Math.cos(2/Tr*t), cy - r*Math.sin(2/Tr*t));
              ctx.stroke();
              t += .2;
              h += 4;
          }
          h = init_h;
      }
      draw();

      var inputs = document.getElementsByTagName('input');
      for(var i = 0; i < inputs.length; i++) {
          inputs[i].addEventListener('input', function() {
              window[this.id] = this.value;
              draw();
          });
      }

      function loop() {
          draw();
          h += 4;
          h %= 360;
          //requestAnimationFrame(loop)
      };
      loop();
    })();
    var audioContext = new AudioContext();

    var query = window.location.search.substring(1);
    var fileName = query.split('=')[1];
    var mp3Path = fileName + '.mp3';
    //$('#download').attr('href', mp3Path).show();
    var audioBuffer = 0;

    var request = new XMLHttpRequest();
	  request.open("GET", "https://s3-us-west-2.amazonaws.com/goatmp3bucket/" + mp3Path, true);
	  request.responseType = "arraybuffer";
	  request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) {
	    	audioBuffer = buffer;
		} );
	}
  sleep(5000);
	request.send();

    document.getElementById("download").href="https://s3-us-west-2.amazonaws.com/goatmp3bucket/" + mp3Path;
    document.getElementById("download").style.display = "block";
  //  console.log('huh');

    var audio = document.getElementById('audio');
    audio.src = "https://s3-us-west-2.amazonaws.com/goatmp3bucket/" + mp3Path;
    var ctx = new AudioContext();
    var analyser = ctx.createAnalyser();
    //var audioSrc = ctx.createMediaElementSource(audio);
    var audioSrc = ctx.createBufferSource();
    var mrgoat = new Image();
    mrgoat.src = "assets/goat.png";
    // we have to connect the MediaElementSource with the analyser
    audioSrc.connect(analyser);
    analyser.connect(ctx.destination);
    // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
    // analyser.fftSize = 64;
    // frequencyBinCount tells you how many values you'll receive from the analyser
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    // we're ready to receive some data!
    var canvas = document.getElementById('canvas'),
        cwidth = canvas.width,
        cheight = canvas.height - 4,
        meterWidth = 60, //width of the meters in the spectrum
        gap = 4, //gap between meters
        capHeight = 4,
        capStyle = '#fff',
        meterNum = 1600 / (60 + 4), //count of the meters
        capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
    ctx = canvas.getContext('2d'),
    gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(1, '#fff');
    gradient.addColorStop(0.5, '#0ff');
    gradient.addColorStop(0, '#00f');
    // loop
    function renderFrame() {
        var array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var step = Math.round(array.length / meterNum); //sample limited data from the total array
        ctx.clearRect(0, 0, cwidth, cheight);
        for (var i = 0; i < meterNum; i++) {
          var value = array[i * step];

            if (capYPositionArray.length < Math.round(meterNum)) {
                capYPositionArray.push(value);
            };
            ctx.fillStyle = capStyle;
            //draw the cap, with transition effect
            if (value < capYPositionArray[i]) {
                //ctx.fillRect(i * 22, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                ctx.drawImage(mrgoat, (i-1) * 64, cheight - 2 * (--capYPositionArray[i]) - 100, 200, 140);
            } else {
                //ctx.fillRect(i * 22, cheight - value, meterWidth, capHeight);
                ctx.drawImage(mrgoat, (i-1) * 64, cheight - 2 * value - 100, 200, 140);
                capYPositionArray[i] = value;
            };
            ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
            ctx.fillRect(i * 64 /*meterWidth+gap*/ , cheight - 2 * value + capHeight, meterWidth, cheight); //the meter
        }
        requestAnimationFrame(renderFrame);
    }
    renderFrame();
    audio.play();
};
