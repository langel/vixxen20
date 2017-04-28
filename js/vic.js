

// INITIALIZE VIC CHIP AUDIO INTERFACE

var audio = new (window.AudioContext || window.webkitAudioContext)();
var video = document.getElementById('monitor');

var vic = {
	
	/*
	 * Properties
	 */

	audio_buffer_size: 1024,

	colors: [
		'000000', 'ffffff', 'b61f21',	'4df0ff',
		'b43fff', '44e237', '1a34ff', 'dcd71b',
		'ca5400', 'e9b072', 'e79293', '9af7fd',
		'e09fff', '8fe493', '8290ff', 'e5de85'
	],

	color_bg: 0,     // 00
	color_border: 6, // 01
	color_fg: 1,     // 10
	color_aux: 5,    // 11

	framerate: { // in milliseconds
		ntsc: (1000/60),
		pal: (1000/50)
	},

	screen: video.getContext('2d'),
	screen_pixel_mul: 3,
	screen_char_x: 40,
	screen_char_y: 30,
	screen_x: null,
	screen_y: null,

	video_mode: 'ntsc', // default video standard

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

		// initialize the Video Interface Chip audio
		vic.volume_node.gain.value = 0;
		vic.volume_node.connect(audio.destination);
		vic.audio_node = audio.createScriptProcessor(vic.audio_buffer_size, 1, 1);
		vic.audio_node.onaudioprocess = vic._buffer_gen;
		vic.audio_node.connect(vic.volume_node);
		console.log(`audio synthesis running at ${audio.sampleRate}Hz`);

		// initialize the Video Interface Chip video
		vic.set_border_color(vic.color_border);
		vic._screen_refresh();
	},

	color_hex(color) {
		return `#${vic.colors[color]}`;
	},

	plot_char: function(x, y, petscii, color) {
		var char_start = (petscii + 256) * 8;
		var char_x = x * 8;
		var char_y = y * 8;
		for (var y=0; y<8; y++) {
			for (var x=0; x<8; x++) {
				if (char_rom[char_start] & (1 << (7-x))) {
					vic._plot_pixel(char_x+x, char_y+y, color);
				}
				else {
					vic._plot_pixel(char_x+x, char_y+y, vic.color_bg);
				}
			}	
			char_start++;
		}
	},

	plot_str: function(x, y, string, color) {
		for (i=0; i<string.length; i++) {
			vic.plot_char(x+i, y, string.charCodeAt(i), color);
		}
	},

	set_bg_color: function(color) {
		vic.color_bg = color;
	},

	set_border_color: function(color) {
		vic.color_border = color;
		document.documentElement.style.background = vic.color_hex(color);
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
						freq = vic.voices[v].clock[vic.video_mode] / (127 - pitch);
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
	},
	
	_plot_pixel: function(x, y, color) {
		color = vic.color_hex(color);
		var mul = vic.screen_pixel_mul;
		//console.log(x*mul + ' ' + y*mul + ' ' + color);
		vic.screen.fillStyle = color;
		vic.screen.fillRect(x * mul, y * mul, mul, mul);
	},

	_screen_refresh: function() {
		var w = vic.screen_pixel_mul * vic.screen_char_x * 8;
		video.setAttribute('width', w);
		video.style.width = video.screen_x = w;
		var h = vic.screen_pixel_mul * vic.screen_char_y * 8;
		video.setAttribute('height', h);
		video.style.height = video.screen_y = h;
		vic.screen.fillStyle = vic.color_hex(vic.color_bg);
		vic.screen.fillRect(0, 0, w, h);
		console.log(w+' '+h);
	}
};

