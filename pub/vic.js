

// INITIALIZE VIC CHIP AUDIO INTERFACE

var audio = new (window.AudioContext || window.webkitAudioContext)();
var video = document.getElementById('monitor');


var vic = {
	
	/*
	 * Properties
	 */

  /*
   * number of frames lagged per buffer @ 44.1kHz (rounded)
   *           NTSC:  0.348 0.696 1.393 2.786 5.572 11.155 22.291
   *           PAL:   0.290 0.580 1.161 2.322 4.644 9.2889 18.576
   */
	audio_buffer_options: [256, 512, 1024, 2048, 4096, 8192, 16384],
	audio_buffer_size: 2,

	char_rom_block: 1,
	char_rom_block_size: 2048,

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
		ntsc: 60,
		pal: 50
	},

  samples_per_frame: null,

	screen: video.getContext('2d', { alpha: false }),
	screen_pixel_mul_x: 2,
	screen_pixel_mul_y: 2,
	screen_char_x: 40,
	screen_char_default: 22,
	screen_char_y: 30,
	screen_char_default: 23,
	screen_ram: new Array(2048).fill({petscii:0, color:1}),
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
	volume: 0,
	volume_node: audio.createGain(),


	/*
	 * Methods
	 */


	init: function() {

		// initialize the Video Interface Chip audio
		vic.volume_node.gain.setValueAtTime(0, 0);
		vic.volume_node.connect(audio.destination);
		vic.build_audio_buffer();
		console.log(`audio synthesis running at ${audio.sampleRate}Hz`);

		// initialize character table cache
		vic.char_table = document.createElement('canvas');
		vic.char_table_ctx = vic.char_table.getContext('2d', { alpha: false });
		vic.char_table_ctx.width = vic.char_table.width = 512 * 8;
		vic.char_table_ctx.height = vic.char_table.height = 16 * 8 * 8;
// XXX maybe make this its own method
// should be called when using a new char set
		vic.char_table.tracker = Array(128).fill(null).map(()=>Array(256).fill(0));

		// initialize the Video Interface Chip video
		vic.set_border_color(vic.color_border);
		vic.screen_ram.fill({petscii:0,color:vic.color_fg});
		vic.screen.buff = document.createElement('canvas');
		vic.screen.buff_ctx = vic.screen.buff.getContext('2d', { alpha: false });

		// setup screen resize handling
		window.addEventListener("resize", function() {
			vic._screen_resize();
		});
		vic._screen_resize();
	},


	build_audio_buffer() {
		let buffer = vic.audio_buffer_size;
		let max = vic.audio_buffer_options.length - 1;
		// make sure the buffer value is within range
		if (buffer < 0) {
			console.log('VIXXEN audio buffer already at minimum.');
			vic.audio_buffer_size = 0;
		}
		else if (buffer > max) {
			console.log('VIXXEN audio buffer already at maximum.');
			vic.audio_buffer_size = max;
		}
		// (re)build 
		else {
			buffer_size = vic.audio_buffer_options[buffer];
			// remove old crusty node if it exists
			if (typeof vic.audio_node !== 'undefined') vic.audio_node.disconnect();
			vic.audio_node = audio.createScriptProcessor(buffer_size, 0, 1);
			vic.audio_node.onaudioprocess = vic._buffer_gen;
			vic.audio_node.connect(vic.volume_node);
			console.log(`audio buffer size set to ${buffer_size}`);
		}
	},

	color_hex: function(color) {
		return `#${vic.colors[color]}`;
	},

	get_char: function(x, y) {
		return vic.screen_ram[y * vic.screen_char_x + x];
	},

	get_frame_ms: function() {
		return 1000 / vic.framerate[vic.video_mode];
	},

	plot_char: function(char_x, char_y, petscii, color) {
		// update screen ram with petscii code
		vic.screen_ram[char_y * vic.screen_char_x + char_x] = {petscii:petscii,color:color};
		// check char table for existing render
		var table_x = petscii;
		var table_y = vic.color_bg * 8 + color;
		// if render does not exist then render
		if (vic.char_table.tracker[table_y][table_x] == 0) {
			var char_start = vic.char_rom_block * vic.char_rom_block_size + petscii * 8;
			var color_bg = vic.color_hex(vic.color_bg);
			var color_fg = vic.color_hex(color);
			vic.char_table.tracker[table_y][table_x] = true;
			var table_x_loc = table_x * 8;
			var table_y_loc = table_y * 8;
			for (var y=0; y<8; y++) {
				for (var x=0; x<8; x++) {
					if (char_rom[char_start] & (1 << (7-x))) {
						vic.char_table_ctx.fillStyle = color_fg;
					}
					else {
						vic.char_table_ctx.fillStyle = color_bg;
					}
					vic.char_table_ctx.fillRect(table_x_loc + x, table_y_loc + y, 1, 1);
				}	
				char_start++;
			}
		}
		// copy render to screen buff
		var character = vic.char_table_ctx.getImageData(table_x * 8, table_y * 8, 8, 8);
		vic.screen.buff_ctx.putImageData(character, char_x * 8, char_y * 8);
	},

	set_bg_color: function(color) {
		vic.color_bg = color;
	},

	set_border_color: function(color) {
		vic.color_border = color;
		document.documentElement.style.background = vic.color_hex(color);
	},

	set_char_rom_block: function(block) {
		vic.char_rom_block = block;
		vic._screen_refresh();
	},

  set_video_mode: function(mode) {
    vic.video_mode = mode;
    vic.samples_per_frame = audio.sampleRate / vic.framerate[vic.video_mode];
  },

	set_voice_value: function(voice_id, value) {
		vic.voices[voice_id].value = value;
		vic.voices[voice_id].delta_counter = 0;
		// XXX should we reset the delta_counter?
	},

	set_volume: function(value) {
		this.volume = value;
		// 4 bit value max
		var vol = 0;
		if (value > 15) vol = 15;
		if (value <= 0) vol = 0;
		else vol = (value / 15) * 0.5; 
		vic.volume_node.gain.setValueAtTime(vol, 0);
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
						var pitch = vic.voices[v].value;
						//if (pitch == 255) pitch--;
						//freq = vic.voices[v].clock[vic.video_mode] / (128 - (pitch++ & 127));
						freq = vic.voices[v].clock[vic.video_mode] / (128 - (pitch & 127));
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
	
	// XXX not sure when this would be used outside of char rendering
	_plot_pixel: function(x, y, color) {
		color = vic.color_hex(color);
		vic.screen.buff_ctx.fillStyle = color;
		vic.screen.buff_ctx.fillRect(x, y, 1, 1);
	},

	_screen_blit: function() {
		vic.screen.drawImage(vic.screen.buff, 0, 0);
	},

	_screen_refresh: function() {
		var w = vic.screen_char_x * 8;
		var w_mul = vic.screen_pixel_mul_x * vic.screen_char_x * 8;
		var h = vic.screen_char_y * 8;
		var h_mul = vic.screen_pixel_mul_y * vic.screen_char_y * 8;
		// set buffer
		vic.screen.buff.setAttribute('width', w);
		vic.screen.buff.setAttribute('height', h);
		// wipe the background
		vic.screen.buff_ctx.fillStyle = vic.color_hex(vic.color_bg);
		vic.screen.buff_ctx.fillRect(0, 0, w, h);
		// set monitor
		video.setAttribute('width', w);
		video.style.width = video.screen_x = w_mul;
		video.setAttribute('height', h);
		video.style.height = video.screen_y = h_mul;
		// redraw screen ram
		var i = 0;
		for (var y = 0; y < vic.screen_char_y; y++){
			for (var x = 0; x < vic.screen_char_x; x++) {
				var char_data = vic.screen_ram[i]
				vic.plot_char(x, y, char_data.petscii, char_data.color);
				i++;
			}
		}
	},

	_screen_resize: function() {
		// set correct window dimensions
		var width = window.innerWidth;
		var height = window.innerHeight;
		var pixel_width = vic.screen_char_x * 8;
		var pixel_height = vic.screen_char_y * 8;
		vic.screen_pixel_mul_x = Math.floor(width / pixel_width);
		if (vic.screen_pixel_mul_x < 1) vic.screen_pixel_mul_x = 1;
		vic.screen_pixel_mul_y = Math.floor(height / pixel_height);
		if (vic.screen_pixel_mul_y < 1) vic.screen_pixel_mul_y = 1;
		console.log('VIC DEGAUSSED [mul_x:' + vic.screen_pixel_mul_x + ', mul_y:' + vic.screen_pixel_mul_y + ']');
		vic._screen_refresh();
	},

};

