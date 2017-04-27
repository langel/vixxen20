

// INITIALIZE VIC CHIP AUDIO INTERFACE

var audio = new (window.AudioContext || window.webkitAudioContext)();

var vic = {
	
	/*
	 * Properties
	 */

	audio_buffer_size: 1024,

	framerate: { // in milliseconds
		ntsc: (1000/60),
		pal: (1000/50)
	},

	framemode: 'ntsc', // default video standard

	voices: [
		{	// bass
			addr: 36874,
			clock: {
				ntsc: 3995, 
				pal: 4329
			},
			delta_counter: 0,
			delta_pos: 1,
			value: 0
		},
		{	// alto
			addr: 36875,
			clock: {
				ntsc: 7990, 
				pal: 8659
			},
			delta_counter: 0,
			delta_pos: 1,
			value: 0
		},
		{	// soprano
			addr: 36876,
			clock: {
				ntsc: 15980, 
				pal: 17320
			},
			delta_counter: 0,
			delta_pos: 1,
			value: 0
		},
		{	// noise
			addr: 36877,
			clock: {
				ntsc: 31960, 
				pal: 34640
			},
			delta_counter: 0,
			delta_pos: 1,
			value: 0
		}
	],

	volume_node: audio.createGain(),

	/*
	 * Methods
	 */

	init: function() {
		// inits all aspects of Video Interface Chip
		// XXX move out of audio interface?
		vic.volume_node.gain.value = 0;
		vic.volume_node.connect(audio.destination);
		vic.audio_node = audio.createScriptProcessor(vic.audio_buffer_size, 1, 1);
		vic.audio_node.onaudioprocess = vic._buffer_gen;
		vic.audio_node.connect(vic.volume_node);
		console.log(`audio synthesis running at ${audio.sampleRate}Hz`);
	},

	set_voice_value: function(voice_id, value) {
		vic.voices[voice_id].value = value;
		// XXX should we reset the delta_counter?
	},

	set_volume: function(value) {
		// 4 bit value max
		var vol = 0;
		if (value > 15) vol = 15;
		if (value <= 0) vol = 0;
		else vol = (value / 15) * 0.5; 
		vic.volume_node.gain.value = vol;
	},

	/*
	 * Under le Hood
	 */

	_buffer_gen: function(e) {
		var buffer = e.outputBuffer.getChannelData(0);
		var delta_mix;
		for (var i = 0; i < buffer.length; i++) {
			delta_mix = 0;
			// cycle through all voices
			for (var v = 0; v < 4; v++) {
				// make sure voices are switched on
				if (vic.voices[v].value & 128) {
					if (vic.voices[v].delta_counter <= 0) {
						var pitch = vic.voices[v].value - 128;
						if (pitch > 127) pitch = 129;
						freq = vic.voices[v].clock[vic.framemode] / (127 - pitch);
						// handle sqaures
						if (v != 3) {
							vic.voices[v].delta_counter = audio.sampleRate / freq / 2;
							vic.voices[v].delta_pos *= -1;
						}
						// handle noise
						else {
							vic.voices[v].delta_counter = audio.sampleRate / freq;
							vic.voices[v].delta_pos = (Math.random()*2)-1;
						}
					}
					delta_mix += vic.voices[v].delta_pos;
					vic.voices[v].delta_counter--;
				}
			}
			buffer[i] = delta_mix;
		}
	}
};

