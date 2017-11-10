

var vixxen = {

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
			return str.toString(10).padStart(len, pad);
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
    main: function() {
	 	window.setTimeout(vixxen.frame.main, vic.get_frame_ms());
		vixxen.frame.hooks.forEach((hook) => {
        window[hook.object][hook.method]();
      });
    }
  },


	init: function() {
		// wut
		vic.init();
		// escalate boot process
		setTimeout(function() {
			vixxen.screen.clear();
			vic.set_volume(3);
			var boot_counter = 0;
			var bootscroll = function() {
				if (boot_counter < 128) {
					var print_color = boot_counter % 7 + 1;
					vixxen.cursor.print('VIXXEN20 ', print_color);
					vixxen.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)), print_color);
					vixxen.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)+96) + ' ', print_color);
					boot_counter++;
					vic.set_voice_value(0, boot_counter + 128);
					vic.set_voice_value(1, boot_counter + 128);
					vic.set_voice_value(2, boot_counter + 128);
					vic.set_voice_value(3, boot_counter + 128);
					setTimeout(bootscroll, vic.get_frame_ms); 
				}
				else {
					vic.set_voice_value(0, 0);
					vic.set_voice_value(1, 0);
					vic.set_voice_value(2, 0);
					vic.set_voice_value(3, 0);
					vixxen.screen.clear();
					vic.plot_str(0, 1, ' V I X X E N   2 0 ', 5);
					// XXX loading beta-k manually
					//vixxen.load('beta_k');
					beta_k.init();
				}
			};
			bootscroll();
      vixxen.frame.main();
		}, 100);
	},

	screen: {

		clear: function() {
			console.log('clearing screen');
			vixxen.cursor.pos = 0;
			for (var i = 0; i < vic.screen_ram.length; i++) {
				vic.screen_ram[i] = vixxen.screen.empty_char;
			}
			vic._screen_refresh();
		},

		empty_char: {petscii:32, color:vic.color_fg},

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
				var clipboard = vic.screen.getImageData(0, 8 * vic.screen_pixel_mul, vic.screen_char_x * 8 * vic.screen_pixel_mul, (vic.screen_char_y - 1) * 8 * vic.screen_pixel_mul);
				// wipe the background
				vic.screen.fillStyle = vic.color_hex(vic.color_bg);
				vic.screen.fillRect(0, 0, vic.screen_char_x * 8 * vic.screen_pixel_mul, vic.screen_char_y * 8 * vic.screen_pixel_mul);
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

