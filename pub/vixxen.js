

var vixxen = {

	autoload: 'booter',

	cursor: {

		blink_rate: 30,
		color: 1,
		pos: 0,

		get_pos: function() {
			return {
				x: vixxen.cursor.pos % vic.screen_char_x,
				y: Math.floor(vixxen.cursor.pos / vic.screen_char_x)
			};
		},

		print: function(string, color) {
			for (var i=0; i<string.length; i++) {
				var pos = vixxen.cursor.get_pos();
				if (pos.y >= vic.screen_char_y) {
					vixxen.screen.scroll(vixxen.screen.scroll_much);
					pos.y -= vixxen.screen.scroll_much;
					vixxen.cursor.pos = vixxen.cursor.pos - vic.screen_char_x * vixxen.screen.scroll_much;
				}
				vic.plot_char(pos.x, pos.y, string.charCodeAt(i), color);
				vixxen.cursor.pos++;
			}
		}
	},

	display: {
		// return hex string from integer
		hex: function(n) {
			return ('0' + n.toString(16).toUpperCase()).slice(-2);
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
			vixxen.frame.hooks.push(hook);
		},
		hook_remove: function(hook) {
			var i = vixxen.frame.hooks.indexOf(hook);
			if (i >= 0) vixxen.frame.hooks.splice(i, 1);
		},
		hook_remove_all: function() {
			vixxen.frame.hooks = [];
		},
		main: function() {
			// allow loop speed to be changed by NTSC/PAL setting
			window.setTimeout(vixxen.frame.main, vic.get_frame_ms());
			vixxen.frame.hooks.forEach((hook) => {
				window[hook.object][hook.method]();
			});
		}
	},

	load: function(ware) {
		if (typeof window[ware] === 'undefined') {
			console.log('LOADING ' + ware);
			var waretag = document.createElement('script');
			waretag.setAttribute("type", "text/javascript");
			waretag.setAttribute("src", 'warez/' + ware + '/main.js');
			document.getElementsByTagName("head")[0].appendChild(waretag);
			setTimeout(function() {
				window[ware].init();
			}, 250);
		}
		else window[ware].init();
		console.log('RUNNING ' + ware);
	},

	init: function() {
		// wut
		vic.init();
		this.frame.main();
		// escalate boot process
		this.load(this.autoload);
	},

	screen: {

		clear: function() {
			console.log('CLR');
			vixxen.cursor.pos = 0;
			for (var i = 0; i < vic.screen_ram.length; i++) {
				vic.screen_ram[i] = vixxen.screen.empty_char;
			}
			vic._screen_refresh();
		},

		empty_char: {
			petscii:32, 
			color:vic.color_fg
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

		scroll: function(much) {
			for (var m = 0; m < much; m++) {
				var new_ram = new Array(vic.screen_char_x * vic.screen_char_y).fill(vixxen.screen.empty_char);
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
		}
	}
}

window.onload = function() {
	vixxen.init();
};

var fill_color = 0;


fill_screen = function() {
	var max_x = Math.floor(vic.screen_x / vic.pixel_mul);
	var max_y = Math.floor(vic.screen_y / vic.pixel_mul);
	for (var y=0; y<max_y; y++) {
		for (var x=0; x<max_x; x++) {
			vic.plot_pixel(x, y, fill_color % 15) 
			fill_color++;
		}
	}
}

//fill_screen();

character_rom_test = function() {
	var char_count = 0;
	for (var y=0; y<16; y++) {
		for (var x=0; x<16; x++) {
			vic.plot_char(x, y, char_count, 1);
			char_count++;
		}
	}
}
