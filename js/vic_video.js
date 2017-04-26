

// INITIALIZE VIC-ESQUE VIDEO INTERFACE


var monitor = document.getElementById('monitor');
var x_max = 640;
var y_max = 512;
monitor.setAttribute('width', x_max);
monitor.setAttribute('height', y_max);
monitor.style.width = x_max;
monitor.style.height = y_max;

var video = {
	screen: monitor.getContext('2d'),
	pixel_mul: 4,

	colors: [
		'000000',
		'ffffff',
		'b61f21',
		'4df0ff',
		'b43fff',
		'44e237',
		'1a34ff',
		'dcd71b',
		'ca5400',
		'e9b072',
		'e79293',
		'9af7fd',
		'e09fff',
		'8fe493',
		'8290ff',
		'e5de85'
	],

	bg_color: 0,

	set_bg_color: function(color) {
		this.bg_color = color;
	},

	plot_pixel: function(x, y, color) {
		color = `#${this.colors[color]}`;
		var mul = this.pixel_mul;
		//console.log(x*mul + ' ' + y*mul + ' ' + color);
		this.screen.fillStyle = color;
		this.screen.fillRect(x * mul, y * mul, mul, mul);
	},

	plot_char: function(x, y, petscii, color) {
		var char_start = (petscii + 256) * 8;
		var char_x = x * 8;
		var char_y = y * 8;
		for (y=0; y<8; y++) {
			for (x=0; x<8; x++) {
				if (char_rom[char_start] & (1 << (7-x))) {
					this.plot_pixel(char_x+x, char_y+y, color);
				}
				else {
					this.plot_pixel(char_x+x, char_y+y, video.bg_color);
				}
			}	
			char_start++;
		}
	},

	plot_str: function(x, y, string, color) {
		for (i=0; i<string.length; i++) {
			this.plot_char(x+i, y, string.charCodeAt(i), color);
		}
	}
}

var fill_color = 0;


fill_screen = function() {
	var max_x = Math.floor(x_max / video.pixel_mul);
	var max_y = Math.floor(y_max / video.pixel_mul);
	for (y=0; y<max_y; y++) {
		for (x=0; x<max_x; x++) {
			video.plot_pixel(x, y, fill_color % 15) 
			fill_color++;
		}
	}
}

fill_screen();

character_rom_test = function() {
	var char_count = 0;
	for (y=0; y<16; y++) {
		for (x=0; x<16; x++) {
			video.plot_char(x, y, char_count, 1);
			char_count++;
		}
	}
}
