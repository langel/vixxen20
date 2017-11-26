

// INITIALIZE VIC CHIP AUDIO INTERFACE

var audio = new (window.AudioContext || window.webkitAudioContext)();
var video = document.getElementById('monitor');

var vic = {
	
	/*
	 * Properties
	 */

	audio_buffer_size: 1024,

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
		ntsc: (1000/60),
		pal: (1000/50)
	},

	screen: video.getContext('2d'),
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
		vic.screen_ram.fill({petscii:0,color:vic.color_fg}),

		// setup screen resize handling
		window.addEventListener("resize", function() {
			vic._screen_resize();
		});
		vic._screen_resize();
	},

	color_hex: function(color) {
		return `#${vic.colors[color]}`;
	},

	get_char: function(x, y) {
		return vic.screen_ram[y * vic.screen_char_x + x];
	},

	get_frame_ms: function() {
		return vic.framerate[vic.video_mode];
	},

	plot_char: function(x, y, petscii, color) {
		vic.screen_ram[y * vic.screen_char_x + x] = {petscii:petscii,color:color};
		var char_start = vic.char_rom_block * vic.char_rom_block_size + petscii * 8;
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

	set_bg_color: function(color) {
		vic.color_bg = color;
	},

	set_border_color: function(color) {
		vic.color_border = color;
		document.documentElement.style.background = vic.color_hex(color);
	},

	set_char_rom_block(block) {
		vic.char_rom_block = block;
		vic._screen_refresh();
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
						var pitch = vic.voices[v].value;
						/* 
							 Programmer's Reference Guide on Sound --

								  Frequency = Clock / (127-X)

								  X is the number from 0 to 127 that is put into the frequency
								register. If X is 127, then use -1 for X in the formula. The value of
								Clock comes from the following table:
								 +----------+-----------------+-----------------+
								 | Register |  NTSC (US TV's) |  PAL (European) |
								 +----------+-----------------+-----------------+
								 |  36874   |       3995      |       4329      |
								 |  36875   |       7990      |       8659      |
								 |  36876   |      15980      |      17320      |
								 |  36877   |      31960      |      34640      |
								 +----------+-----------------+-----------------+


							VIC-I Doc by Marko Mäkelä / Frequency Formulas by Levente Hársfalvi --

								 N: bass enable,    R: freq f=Phi2/256/(128-(($900a+1)&127))
								 O: alto enable,    S: freq f=Phi2/128/(128-(($900b+1)&127))
								 P: soprano enable, T: freq f=Phi2/64/(128-(($900c+1)&127))
								 Q: noise enable,   U: freq f=Phi2/32/(128-(($900d+1)&127))
								 * PAL:  Phi2=4433618/4 Hz
								 * NTSC: Phi2=14318181/14 Hz
						*/
						/*
							RIPPED FROM VICE

							src/vic20/vic20sound.c

    for (j = 0; j < 3; j++) {
        int chspeed = "\4\3\2"[j];

        if (snd.ch[j].ctr > cycles) {
            snd.accum += snd.ch[j].out * cycles;
            snd.ch[j].ctr -= cycles;
        } else {
            for (i = cycles; i; i--) {
                snd.ch[j].ctr--;
                if (snd.ch[j].ctr <= 0) {
                    int a = (~snd.ch[j].reg) & 127;
                    a = a ? a : 128;
                    snd.ch[j].ctr += a << chspeed;
                    if (snd.ch[j].reg & 128) {
                        unsigned char shift = snd.ch[j].shift;
                        shift = ((shift << 1) | ((shift & 128) >> 7)) ^ 1;
                        snd.ch[j].shift = shift;
                        snd.ch[j].out = shift & 1;
                    } else {
                        snd.ch[j].shift <<= 1;
                        snd.ch[j].out = 0;
                    }
                }
                snd.accum += snd.ch[j].out;
            }
        }
    }

    if (snd.ch[3].ctr > cycles) {
        snd.accum += snd.ch[3].out * cycles;
        snd.ch[3].ctr -= cycles;
    } else {
        for (i = cycles; i; i--) {
            snd.ch[3].ctr--;
            if (snd.ch[3].ctr <= 0) {
                int a = (~snd.ch[3].reg) & 127;
                a = a ? a : 128;
                snd.ch[3].ctr += a << 4;
                if (snd.ch[3].reg & 128) {
					 	// noisepattern is an array full of seemingly random bytes
                    snd.ch[3].out = (noisepattern[(snd.noisectr >> 3) & 1023] >> (snd.noisectr & 7)) & 1;
                } else {
                    snd.ch[3].out = 0;
                }
                snd.noisectr++;
            }
            snd.accum += snd.ch[3].out;
        }
    }
						*/
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
	
	_plot_pixel: function(x, y, color) {
		color = vic.color_hex(color);
		var xmul = vic.screen_pixel_mul_x;
		var ymul = vic.screen_pixel_mul_y;
		vic.screen.fillStyle = color;
		vic.screen.fillRect(x * xmul, y * ymul, xmul, ymul);
	},

	_screen_refresh: function() {
		var w = vic.screen_pixel_mul_x * vic.screen_char_x * 8;
		video.setAttribute('width', w);
		video.style.width = video.screen_x = w;
		var h = vic.screen_pixel_mul_y * vic.screen_char_y * 8;
		video.setAttribute('height', h);
		video.style.height = video.screen_y = h;
		// wipe the background
		vic.screen.fillStyle = vic.color_hex(vic.color_bg);
		vic.screen.fillRect(0, 0, w, h);
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

