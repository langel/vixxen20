

var kernel = {

	//autoload: 'booter',
	autoload: 'baby_k',

	ascii2petscii: function(string) {
		var new_string = '';
		for (var i = 0; i < string.length; i++) {
			var a = string[i].charCodeAt();
			var p;
			if (a < 32) p = a + 96;
			else if (a < 96) p = a;
			else if (a < 128) p = a - 96;
			else if (a < 160) p = a + 96;
			else if (a < 224) p = a;
			else if (a < 256) p = a - 96;
			new_string += String.fromCodePoint(p);
		}
		return new_string;
	},

	character_rom_test: function() {
		var char_count = 0;
		for (var y=0; y<16; y++) {
			for (var x=0; x<16; x++) {
				vic.plot_char(x, y, char_count, 1);
				char_count++;
			}
		}
	},

	cursor: {
		blink_rate: 30,
		color: 1,
		pos: 0,

		get_pos: function() {
			return {
				x: kernel.cursor.pos % vic.screen_char_x,
				y: Math.floor(kernel.cursor.pos / vic.screen_char_x)
			};
		},

		print: function(string, color) {
			for (var i=0; i<string.length; i++) {
				var pos = kernel.cursor.get_pos();
				if (pos.y >= vic.screen_char_y) {
					kernel.screen.scroll(kernel.screen.scroll_much);
					pos.y -= kernel.screen.scroll_much;
					kernel.cursor.pos = kernel.cursor.pos - vic.screen_char_x * kernel.screen.scroll_much;
				}
				vic.plot_char(pos.x, pos.y, string.charCodeAt(i), color);
				kernel.cursor.pos++;
			}
		}
	},

	display: {
		// return hex string from integer
		hex: function(n) {
			return n.toString(16).toUpperCase();
		},
		// return hex string from integer in byte form
		hex_byte: function(n) {
			return n.toString(16).toUpperCase().padStart(2, '0');;
		},
		// return integer from hex string
		num: function(n) {
			return parseInt(n, 16);
		},
		// return padded string for right alignment
		pad: function(str, len, pad) {
			if (typeof str !== 'string') str = str.toString(10);
			return str.padStart(len, pad);
		}
	},


	frame: {
		hooks: [],
		hook_add: function(hook) {
			kernel.frame.hooks.push(hook);
		},
		hook_remove: function(hook) {
			var i = kernel.frame.hooks.indexOf(hook);
			if (i >= 0) kernel.frame.hooks.splice(i, 1);
		},
		hook_remove_all: function() {
			kernel.frame.hooks = [];
		},
		main: function() {
			// allow loop speed to be changed by NTSC/PAL setting
			let this_frame = Date.now();
			let timeout = Math.floor(vic.get_frame_ms() - (this_frame - kernel.frame.last_frame));
			kernel.frame.last_frame = this_frame;
			timeout = (timeout < 1) ? 1 : timeout;
			kernel.frame.hooks.forEach((hook) => {
				window[hook.object][hook.method]();
			});
			vic._screen_blit();
			window.setTimeout(kernel.frame.main, timeout);
		}
	},

	init: function() {
		// wut
		console.log('VIXXEN20 STARTED');
		this.frame.last_frame = Date.now();
		vic.init();
		this.frame.main();
		// escalate boot process
		this.load_js(this.autoload);
	},
	
	load_js: function(ware) {
		console.log('LOADING ' + ware);
		var ware_file = document.createElement('script');
		ware_file.src = 'warez/' + ware + '/main.js';
		document.body.appendChild(ware_file);
		var includes_counter = 0;
		ware_file.onload = function() {
			var includes = window[ware].includes;
			if (Array.isArray(includes)) includes.forEach(function(lib) {
				includes_counter++;
				lib_file = document.createElement('script');
				lib_file.src = 'warez/' + ware + '/' + lib + '.js';
				document.body.appendChild(lib_file);
				lib_file.onload = function() {
					includes_counter--;
				}
			});
			var wait_loop = function() {
				if (includes_counter == 0) {
					window[ware].init();
					return;
				}
				setTimeout(wait_loop, 100);
			}
			wait_loop();
		}
	},

	plot_str: function(x, y, string, color) {
		string = this.ascii2petscii(string.toString());
		for (var i = 0; i < string.length; i++) {
			vic.plot_char(x+i, y, string.charCodeAt(i), color);
		}
	},

	plot_str_inv: function(x, y, string, color) {
		string = string.toString();
		var new_string = '';
		for (var i = 0; i < string.length; i++) {
			new_string += String.fromCodePoint(parseInt(string.charCodeAt(i)) + 128);
		}
		kernel.plot_str(x, y, new_string, color);
	},

	screen: {

		clear: function() {
			console.log('CLR');
			kernel.cursor.pos = 0;
			for (var i = 0; i < vic.screen_ram.length; i++) {
				vic.screen_ram[i] = kernel.screen.empty_char;
			}
			vic._screen_refresh();
		},

		empty_char: {
			petscii:32, 
			color:vic.color_fg
		},
		
		get_ram: function(x, y, length) {
			var start = x + y * vic.screen_char_x;
			var ram = [];
			for (var i = 0; i < length; i++) {
				ram.push(vic.screen_ram[start + i]); 
			}
			return ram;
		},

		get_str: function(x, y, length) {
			var start = x + y * vic.screen_char_x;
			var string = '';
			for (var i = 0; i < length; i++) {
				string += String.fromCharCode(vic.screen_ram[start + i].petscii); 
			}
			return string;
		},

		scroll_much: 1,

// XXX is this broken now because of screen buff?
		scroll: function(much) {
			for (var m = 0; m < much; m++) {
				var new_ram = new Array(vic.screen_char_x * vic.screen_char_y).fill(kernel.screen.empty_char);
				for (var n = 0; n < vic.screen_ram.length - vic.screen_char_x; n++) {
					new_ram[n] = vic.screen_ram[vic.screen_char_x + n];
				}
				vic.screen_ram = new_ram;
				delete(new_ram);
				// cut and paste the kept section of the screen
				var clipboard = vic.screen.getImageData(0, 8 * vic.screen_pixel_mul_x, vic.screen_char_x * 8 * vic.screen_pixel_mul_x, (vic.screen_char_y - 1) * 8 * vic.screen_pixel_mul_y);
				// wipe the background
				vic.screen.fillStyle = vic.color_hex(vic.color_bg);
				vic.screen.fillRect(0, 0, vic.screen_char_x * 8 * vic.screen_pixel_mul_x, vic.screen_char_y * 8 * vic.screen_pixel_mul_y);
				// paste that shit in there
				vic.screen.putImageData(clipboard, 0 , 0);
			}
		},

		set_ram: function(x, y, ram) {
			for (var i = 0; i < ram.length; i++) {
				vic.plot_char(x, y + 1, ram[i].petscii, ram[i].color);
			}
			return ram;
		},
	},

	silent: function() {
		vic.set_voice_value(0, 0);
		vic.set_voice_value(1, 0);
		vic.set_voice_value(2, 0);
		vic.set_voice_value(3, 0);
	},

	_attach_js: function(file) {
		if (typeof window[file] === 'undefined') {
			var filetag = document.createElement('script');
			filetag.setAttribute("type", "text/javascript");
			filetag.setAttribute("src", file + '.js');
			document.getElementsByTagName("head")[0].appendChild(filetag);
		}
	}
}

window.onload = function() {
	kernel.init();
};




