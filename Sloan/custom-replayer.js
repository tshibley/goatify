// based on jasmid replayer.js with some edits for events
function Replayer(midiFile, beep) {
	var trackStates = [];
	var beatsPerMinute = 120;
	var ticksPerBeat = midiFile.header.ticksPerBeat;
	var channelCount = 16;
	var startTime = Date.now();
	
	for (var i = 0; i < midiFile.tracks.length; i++) {
		trackStates[i] = {
			'nextEventIndex': 0,
			'ticksToNextEvent': (
				midiFile.tracks[i].length ?
					midiFile.tracks[i][0].deltaTime :
					null
			)
		};
	}
	
	function Channel() {
		
		function noteOn(note, velocity, latency) {
			console.log('noteOn:' + note + ', ' + velocity + ',' + latency);
			var timeElapsed = Date.now() - startTime;
			setTimeout(() => { beep(note, velocity); }, latency*1000 - timeElapsed);
		}
		function noteOff(note, velocity, latency) {
			console.log('noteOff:' + note + ', ' + latency);
		}
		
		return {
			'noteOn': noteOn,
			'noteOff': noteOff,
		}
	}
	
	var channels = [];
	for (var i = 0; i < channelCount; i++) {
		channels[i] = Channel();
	}
	
	var nextEventInfo;
	var currentTime = 0;
	var secondsToNextEvent = 0;
	
	function getNextEvent() {
		var ticksToNextEvent = null;
		var nextEventTrack = null;
		var nextEventIndex = null;
		
		for (var i = 0; i < trackStates.length; i++) {
			if (
				trackStates[i].ticksToNextEvent != null
				&& (ticksToNextEvent == null || trackStates[i].ticksToNextEvent < ticksToNextEvent)
			) {
				ticksToNextEvent = trackStates[i].ticksToNextEvent;
				nextEventTrack = i;
				nextEventIndex = trackStates[i].nextEventIndex;
			}
		}
		if (nextEventTrack != null) {
			/* consume event from that track */
			var nextEvent = midiFile.tracks[nextEventTrack][nextEventIndex];
			if (midiFile.tracks[nextEventTrack][nextEventIndex + 1]) {
				trackStates[nextEventTrack].ticksToNextEvent += midiFile.tracks[nextEventTrack][nextEventIndex + 1].deltaTime;
			} else {
				trackStates[nextEventTrack].ticksToNextEvent = null;
			}
			trackStates[nextEventTrack].nextEventIndex += 1;
			/* advance timings on all tracks by ticksToNextEvent */
			for (var i = 0; i < trackStates.length; i++) {
				if (trackStates[i].ticksToNextEvent != null) {
					trackStates[i].ticksToNextEvent -= ticksToNextEvent
				}
			}
			nextEventInfo = {
				'ticksToEvent': ticksToNextEvent,
				'event': nextEvent,
				'track': nextEventTrack,
				'latency': currentTime
			}
			var beatsToNextEvent = ticksToNextEvent / ticksPerBeat;
			secondsToNextEvent = beatsToNextEvent / (beatsPerMinute / 60);
			currentTime += secondsToNextEvent;
		} else {
			nextEventInfo = null;
			secondsToNextEvent = null;
			self.finished = true;
		}
	}
	
	getNextEvent();
	
	function generate(seconds) {
		var secondsRemaining = seconds;
		var dataOffset = 0;
		
		while (true) {
			if (secondsToNextEvent != null && secondsToNextEvent <= secondsRemaining) {
				/* generate samplesToNextEvent samples, process event and repeat */
				if (secondsToNextEvent > 0) {
					//synth.generateIntoBuffer(samplesToGenerate, data, dataOffset);
					secondsRemaining -= secondsToNextEvent;
					secondsToNextEvent = 0;
				}
				
				handleEvent();
				getNextEvent();
			} else {
				/* generate samples to end of buffer */
				if (secondsRemaining > 0) {
					//synth.generateIntoBuffer(samplesRemaining, data, dataOffset);
					secondsToNextEvent -= secondsRemaining;
				}
				break;
			}
		}
	}
	
	function handleEvent() {
		var event = nextEventInfo.event;
		switch (event.type) {
			case 'meta':
				switch (event.subtype) {
					case 'setTempo':
						beatsPerMinute = 60000000 / event.microsecondsPerBeat
				}
				break;
			case 'channel':
				switch (event.subtype) {
					case 'noteOn':
						channels[event.channel].noteOn(event.noteNumber, event.velocity, nextEventInfo.latency);
						break;
					case 'noteOff':
						channels[event.channel].noteOff(event.noteNumber, event.velocity, nextEventInfo.latency);
						break;
					case 'programChange':
						console.log('program change to ' + event.programNumber);
						break;
				}
				break;
		}
	}
	
	var self = {
		'generate': generate,
		'finished': false
	}
	return self;
}
