

var beta_k_pattern_grid = {

	label: 'PATTERN EDITOR',

	type: 'custom',

	channel: 0,
	pattern: 0,
	row: 0,
	display: '---',
	value: 0,
	x_origin: 2,
	y_origin: 10,
	x: 3,
	y: 10,
	
	patterns_display: [
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	],

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
		81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80
	],

	note_specials: ['---','OFF','NXT','END'],

	cursor_forward: function() {
		if (this.row == 15) this.row = 0;
		else this.row++;
	},

	draw_cell: function(channel, row, pattern, color) {
		var value = pattern[row];
		var cell_pos = this.get_cell_position(channel, row);
		vixxen.plot_str(cell_pos.x, cell_pos.y, value, color);
	},

	draw_channel: function(channel, pattern) {
		for (var i = 0; i < 16; i++) {
			this.draw_cell(channel, i, pattern, 1);
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
		if (this.note_keycodes.indexOf(parseInt(key, 10)) !== -1) {
			note = this.note_keycodes.indexOf(parseInt(key, 10));
			this.display = this.note_names[note%12];
			this.display += Math.floor(note / 12) + 1 + this.channel;
			note = this.note_values[note];
		}
		// '---' clear note value with DEL or BACKSPACE
		else if (key == 46 || key == 8) {
			note = 0;
			this.display = this.note_specials[note];
		}
		// 'OFF' enter note off with 1
		else if (key == 49) {
			note = 1;
			this.display = this.note_specials[note];
		}
		// 'NXT' enter note off with ` 
		else if (inputs.mod.shift && key == 192) {
			note = 2;
			this.display = this.note_specials[note];
		}
		// 'END' enter note off with ~ 
		else if (key == 192) {
			note = 3;
			this.display = this.note_specials[note];
		}
		if (typeof note !== 'undefined') {
			var song = beta_k.song;
			var old_value = song.patterns[this.channel][this.row];
			song.patterns[this.channel][this.row] = note;
			this.patterns_display[this.channel][this.row] = this.display;
			this.cursor_forward();
			var r = this.row;
			if (r !== 0) while (song.patterns[this.channel][r] === old_value || song.patterns[this.channel][r] === 0) {
				song.patterns[this.channel][r] = 0;
				this.patterns_display[this.channel][r] = this.note_specials[0];
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
	},

	on_load: function(channel, pattern) {
		for (var i = 0; i < 16; i++) {
			var note = pattern[i];
			var display;
			if (note >= 128) {
				if (this.note_values.indexOf(note)) {
					this.note_names[this.note_values.indexOf(note) % 12];
				}
				else display = note;
			}
			else display = this.note_specials[note];
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

	play_next_row: function() {
		this.row_dehighlight(this.play_position);
		this.play_position++;
		if (this.play_position >= 16) this.play_position = 0;
		this.row_highlight(this.play_position);
		// act on pattern row data
		for (var i = 0; i < 4; i++) {
			var value = beta_k.song.patterns[i][this.play_position];
			// PITCH DATA
			if (value >= 128) {
				vic.set_voice_value(i, beta_k.song.patterns[i][this.play_position]);
			}
			// NOTE OFF
			if (value == 1) {
				vic.set_voice_value(i, 0);
			}
			// NEXT PATTERN
			if (value == 2) {
				// there's a smarter way to do this...
				this.row_dehighlight(this.play_position);
				this.play_position = 15;
				this.play_next_row();
			}
			// END SONG
			if (value == 3) {
				this.row_dehighlight(this.play_position);
				beta_k.song_stop();
			}
		}
	},

	play_position: 0,

	row_dehighlight: function(row_id) {
		for (var i = 0; i < 4; i++) {
			this.draw_cell(i, this.play_position, this.patterns_display[i], 1);
		}
		inputs.focus(this);
	},

	row_highlight: function(row_id) {
		for (var i = 0; i < 4; i++) {
			this.draw_cell(i, this.play_position, this.patterns_display[i], 2);
		}
	},

}
