// MAKE IT SING

/*
 * VIC20 Song Data Schema


	BETA-K MEMORY MAP

	1000-1DFF	complete program space address

	1000-10xx	BASIC SYS call to start program
	10XX-13AF	~928 bytes for player
	13B0-13BF	16 char string	'title'
	13C0-13CF	16 char string	'artist'
	13D0-13DF	16 char string	'copyright/info'
	13E0-13EF	16 row speed table
	13F0-13FF	16 row volume table
	1400-1BFF	128 16 row patterns
	1C00-1DFF	128 rows pattern order list
					4 bytes per row for all 4 channels

	pattern object - 16 bytes each
		value h80-hFF	pitch value
		value h00	do nothing
		value h01	note OFF
		value h02	jump to NXT song row
		value h03	END playback
		// XXX ...potential effects...
		// depends on space restraints of player
		value h1x	pitch slide up by x per frame
		value h2x	pitch slide down by x per frame
		value h3x	pitch slide up by x per row
		value h4x	pitch slide down by x per row
		...etc.
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
	note_specials: ['OFF','---','NXT','END'],

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
			draw_channel: function(channel, pattern) {
				var i;
				for (var i = 0; i < 16; i++) {
					var value = pattern[i];
					var cell_pos = this.get_cell_position(channel, i);
					vic.plot_str(cell_pos.x, cell_pos.y, value, 1);
				}
			},
			get_cell_position: function(channel, row) {
				channel++;
				var x = channel * 4 - 4 + this.x_origin;
				var y = row + this.y_origin;
				return { x : x, y : y };
			},
			on_key: function(key) {
				inputs.blur(this);
				var note;
				// enter note value
				if (beta_k.note_keycodes.indexOf(parseInt(key, 10)) !== -1) {
					note = beta_k.note_keycodes.indexOf(parseInt(key, 10));
					this.display = beta_k.note_names[note%12];
					this.display += Math.floor(note / 12) + 1 + this.channel;
					note = beta_k.note_values[note];
				}
				// enter note off with ` or 1 
				else if (key == 49 || key == 192) {
					note = 0;
					this.display = beta_k.note_specials[note];
				}
				// clear note value with DEL
				else if (key == 46) {
					note = 1;
					this.display = beta_k.note_specials[note];
				}
				if (typeof note !== 'undefined') {
					console.log(note + ' ' + this.display);
					var song = beta_k.song;
					var old_value = song.patterns[this.channel][this.row];
					song.patterns[this.channel][this.row] = note;
					this.patterns_display[this.channel][this.row] = this.display;
					this.cursor_forward();
					var r = this.row;
					while (song.patterns[this.channel][r] === old_value && r < 16) {
						song.patterns[this.channel][r] = 1;
						this.patterns_display[this.channel][r] = beta_k.note_specials[1];
						r++;
					}
					this.draw_channel(this.channel, this.patterns_display[this.channel]);
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
			on_load: function(channel, pattern) {
				var i;
				for (i = 0; i < 16; i++) {
					var note = pattern[i];
					var display;
					if (note >= 128) {
						if (beta_k.note_values.indexOf(note)) {
							beta_k.note_names[beta_k.note_values.indexOf(note) % 12];
						}
						else display = note;
					}
					else display = beta_k.note_specials[note];
					this.patterns_display[channel][i] = display;
				}
				this.draw_channel(channel, this.patterns_display[this.channel]);
			},
			on_update: function() {
				this.display = this.patterns_display[this.channel][this.row];
				var cell_pos = this.get_cell_position(this.channel, this.row);
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
			value: '---',
			x_origin: 2,
			y_origin: 6,
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
		vixxen.screen.clear();
		vic.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		inputs.init(beta_k.inputs);
		var pattern_editor = inputs.get_current_field();
		this.song = JSON.parse(JSON.stringify(this.new_song));
		var i;
		for (i = 0; i < 4; i++) {
			pattern_editor.on_load(i, this.song.patterns[i]);
		};
		vic.set_volume(10);
		vixxen.frame.hook_add({
			object: 'beta_k',
			method: 'frame'
		});
	},

	pattern: {
		get_cell_value: function(pattern, row) {
			return patterns.data[pattern][row];
		},
		row_dehighlight: function(row_id) {
			var x = beta_k.inputs.fields[0].x_origin; 
			var y = beta_k.inputs.fields[0].y_origin; 
			var text = vixxen.screen.get_str(x, y + row_id, 20);
			vic.plot_str(x, y + row_id, text, 1);
		},
		row_highlight: function(row_id) {
			var x = beta_k.inputs.fields[0].x_origin; 
			var y = beta_k.inputs.fields[0].y_origin; 
			var text = vixxen.screen.get_str(x, y + row_id, 20);
			vic.plot_str(x, y + row_id, text, 2);
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
			if (beta_k.pattern_index >= this.song.pattern_length) beta_k.pattern_index = 0;
     		beta_k.pattern.row_highlight(beta_k.pattern_index);
			var i;
			for (i = 0; i < 4; i++) {
				var value = this.song.patterns[i][beta_k.pattern_index];
				if (value >= 128) {
					vic.set_voice_value(i, this.song.patterns[i][beta_k.pattern_index]);
				}
				// XXX HANDLE ALL THE SPECIAL NOTES
				if (value == 0) {
					vic.set_voice_value(0);
				}
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

	song: 'load a song dummy',
	new_pattern: [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	new_song: {
		title: 'TITLE',
		artist: 'ARTIST',
		pattern_length: 16,
		patterns: [
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
			[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		],
		list: [[0,1,2,3]],
	},
	play_position: {
		list: 0,
		row: 0,
		increase: function() {
			this.row++;
			if (this.row >= 16) {
				this.row = 0;
				this.list++;
				if (this.list >= beta_k.song.list.length) this.list = 0;
			}
		},
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

