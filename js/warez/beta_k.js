// MAKE IT SING

/*
 * VIC20 Song Data Schema

  16 bytes : "title"
  16 bytes : "artist"
  16 bytes : "copy"
  1 byte : base volume and video standard
    bit 7 set is NTSC (unset PAL)
    bits 3-0 volume
  1 byte : base speed
  6 song order objects for the 4 voices, speed, and volume
  n bytes channel pattern objects and tables

  track pattern order object
    1 byte : order length - max of 127
      bit 7 : sets track loop to true
      bits 6-0 : order length 
      value x00 means the track is inactive
    n bytes : pattern numbers in order

  pattern object
    1 byte : pattern length
    n bytes - pattern column data
      value x00 is note off
      values x01-x7f length of repeat
      values x80-xff note value

  volume table object
    1 byte - length of table (row count >> 1)
    n bytes - dual volume values
      values are max 4 bits in size (x00-x0f)
      bits 7-4 even row volume value
      bits 3-0 odd row volume value

  On init the player needs to scan the song data and save pointers in the 
  zero (and maybe 1st) page for order lists and pattern start addresses.

  3583 bytes free ~= 14 pages (in the 4 bit number range)
  ...set aside about 1k for the play routine...
  2.5k = 10 pages (still in the 4 bit number range)

  Given that pattern addresses require hi and lo bytes the player may
  require two bytes per pattern. If using a single page for these pointers
  then the max number of patterns would be 128. Handling patterns and
  volume tables might be interesting...
*/

var beta_k = {

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,
	
	note_values : [
		131,140,145,151,158,161,166,173,178,181,185,189,
		192,197,200,203,206,208,211,214,216,218,220,222,
		224,226,227,229,231,232,233,234,236,237,238,239,
		240,241
	],
	note_names : ['C ','C#','D ','D#','E ','F ','F#','G ','G#','A ','A#','B '],
	note_keycodes : [
		// bottom row
		90,83,88,68,67,86,71,66,72,78,74,77,
		// top row
		81,50,87,51,69,82,53,84,54,89,55,85,73,57,79.48,80
	],

	pattern_index: 0,
	pause: false,

	inputs: {
		fields: [{
			label: 'PATTERN EDITOR',
			type: 'custom',
			cursor_forward: function() {
				if (this.row == 15) this.row = 0;
				else this.row++;
			},
			on_key: function(key) {
				inputs.blur(this);
				var note = beta_k.note_keycodes.indexOf(parseInt(key, 10));
				// enter note value
				if (note >= 0) {
					var note_value = beta_k.note_values[note];
					var old_value = patterns.data[this.channel][this.row];
					patterns.data[this.channel][this.row] = note_value;
					var note_name = beta_k.note_names[note % 12];
					var octave = Math.floor(note / 12) + 1;
					this.patterns_display[this.channel][this.row] = note_name + octave;
					this.cursor_forward();
					var r = this.row;
					while (patterns.data[this.channel][r] == old_value && r < 16) {
						patterns.data[this.channel][r] = note_value;
						this.patterns_display[this.channel][r] = '   ';
						r++;
					}
					beta_k.pattern.draw_channel(this.channel, this.patterns_display[this.channel]);
				}
				// enter note off with ` or 1 
				else if (key == 49 || key == 192) {
					var old_value = patterns.data[this.channel][this.row];
					patterns.data[this.channel][this.row] = 0;
					this.patterns_display[this.channel][this.row] = 'OFF';
					this.cursor_forward();
					var r = this.row;
					while (patterns.data[this.channel][r] == old_value && r < 16) {
						patterns.data[this.channel][r] = 0;
						this.patterns_display[this.channel][r] = '   ';
						r++;
					}
					beta_k.pattern.draw_channel(this.channel, this.patterns_display[this.channel]);
				}
				// move cursor
				else if (key == KEY_ARROW_UP) {
					if (this.row == 0) this.row = 15;
					else this.row--;
				}
				else if (key == KEY_ARROW_RIGHT) {
					if (this.channel == 3) this.channel = 0;
					else this.channel++;
				}
				else if (key == KEY_ARROW_DOWN) {
					this.cursor_forward();
				}
				else if (key == KEY_ARROW_LEFT) {
					if (this.channel == 0) this.channel = 3;
					else this.channel--;
				}
				else if (key == KEY_PAGE_UP) {
					this.row -= 4;
					if (this.row < 0) this.row += 16;
				}
				else if (key == KEY_PAGE_DOWN) {
					this.row += 4;
					if (this.row > 15) this.row -= 16;
				}
				vic.plot_str(24, 26, this.channel + ' ' + this.row + '  ', 2);
			},
			on_update: function() {
				this.display = this.patterns_display[this.channel][this.row];
				var cell_pos = beta_k.pattern.get_cell_position(this.channel, this.row);
				this.x = cell_pos.x;
				this.y = cell_pos.y;
			},
			patterns_display: [
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
				[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			],
			channel: 0,
			pattern: 0,
			row: 0,
			x: 3,
			y: 10,
		},{
			label: 'SPEED  ',
			type: 'range',
			on_update: function() {
				beta_k.frame_rate = this.value;
				this.display = this.label + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 5,
			value_min: 1,
			value_max: 99,
			x: 30,
			y: 3
		},{
			label: 'VOLUME ',
			type: 'range',
			on_update: function() {
				vic.set_volume(this.value);
				this.display = this.label + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 1,
			value_min: 0,
			value_max: 15,
			x: 30,
			y: 4
		}],
		
		global_keys: [{
			key: 13,
			on_update: function() {
				if (vic.video_mode == 'ntsc') vic.video_mode = 'pal';
				else vic.video_mode = 'ntsc';
			}
		},{
			key: 32,
			on_update: function() {
				beta_k.pause = !beta_k.pause;
			}
		}],
	},
	/*
	 * methods
	 */

	init: function() {
		vic.set_volume(10);
		inputs.init(beta_k.inputs);
		beta_k.pattern.draw_all_channels(patterns);
		vic.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		vixxen.frame.hook_add({
			object: 'beta_k',
			method: 'frame'
		});
	},

	pattern: {
		x_origin: 2,
		y_origin: 6,
		draw_all_channels: function(pattern) {
			for (var c = 0; c < 4; c++) { 
				beta_k.pattern.draw_channel(c, pattern.data[c]);
			}
		},
		draw_channel: function(channel, pattern) {
			for (var i = 0; i < 16; i++) {
				var value = pattern[i];
				if (i > 0 && value == pattern[i-1]) value = '   ';
				if (value === 0) value = 'OFF';
				var cell_pos = this.get_cell_position(channel, i);
				vic.plot_str(cell_pos.x, cell_pos.y, value, 1);
			}
		},
		get_cell_position: function(channel, row) {
			channel++;
			x = channel * 5 - 5 + this.x_origin;
			y = row + this.y_origin;
			return { x : x, y : y };
		},
		get_cell_value: function(pattern, row) {
			return patterns.data[pattern][row];
		},
		row_dehighlight: function(row_id) {
			var text = vixxen.screen.get_str(2, 6 + row_id, 20);
			vic.plot_str(2, 6 + row_id, text, 1);
		},
		row_highlight: function(row_id) {
			var text = vixxen.screen.get_str(2, 6 + row_id, 20);
			vic.plot_str(2, 6 + row_id, text, 2);
		},
	},

	frame: function() {
		vic.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (beta_k.pause) {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			vic.plot_str(30, 14, ' PAUSED   ', 1);
			return;
		}
		if (beta_k.frame_counter % beta_k.frame_rate == 0) {
			beta_k.pattern.row_dehighlight(beta_k.pattern_index);
			beta_k.pattern_index++;
			if (beta_k.pattern_index == patterns.length) beta_k.pattern_index = 0;
     		beta_k.pattern.row_highlight(beta_k.pattern_index);
			for (i = 0; i < 4; i++) {
				vic.set_voice_value(i, patterns.data[i][beta_k.pattern_index]);
			}
		}
		var display = (vic.voices[0].value & 128) ? vixxen.display.hex(vic.voices[0].value) : '  ';
		vic.plot_str(30, 8, ' ALTO ' + display, 1);
		var display = (vic.voices[1].value & 128) ? vixxen.display.hex(vic.voices[1].value) : '  ';
		vic.plot_str(30, 9, ' TENO ' + display, 1);
		var display = (vic.voices[2].value & 128) ? vixxen.display.hex(vic.voices[2].value) : '  ';
		vic.plot_str(30, 10, ' SOPR ' + display, 1);
		var display = (vic.voices[3].value & 128) ? vixxen.display.hex(vic.voices[3].value) : '  ';
		vic.plot_str(30, 11, ' NUZZ ' + display, 1);
		vic.plot_str(30, 14, ' PLAYING    ', 1);
		beta_k.frame_counter++;
		vic.plot_str(0, 28, ` FRAME ${beta_k.frame_counter} `, 2);
	},

}


patterns = {
	length: 16,
	data:	[[
		200,
		200,
		200,
		200,
		129,
		129,
		129,
		129,
		129,
		129,
		129,
		128,
		0,
		0,
		0,
		0
	],	[
		0,
		0,
		0,
		0,
		200,
		0,
		200,
		0,
		200,
		0,
		0,
		0,
		200,
		0,
		200,
		0
	],	[
		128,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		155,
		0,
		0,
		155
	],	[
		140,
		129,
		0,
		0,
		155,
		0,
		254,
		0,
		200,
		220,
		0,
		0,
		155,
		0,
		254,
		0
	]]
};

