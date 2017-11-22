

var beta_k_pattern_grid = {

	label: 'PATTERN EDITOR',

	type: 'custom',

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
		vic.plot_str(cell_pos.x, cell_pos.y, value, color);
	},

	draw_channel: function(channel, pattern) {
		var i;
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
		vic.plot_str(24, 26, this.channel + ' ' + this.row + '  ', 2);
	},

	on_load: function(channel, pattern) {
		var i;
		for (i = 0; i < 16; i++) {
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
		var i;
		for (i = 0; i < 4; i++) {
			var value = beta_k.song.patterns[i][this.play_position];
			if (value >= 128) {
				vic.set_voice_value(i, beta_k.song.patterns[i][this.play_position]);
			}
			// XXX HANDLE ALL THE SPECIAL NOTES
			if (value == 1) {
				vic.set_voice_value(i, 0);
			}
		}
	},

	play_position: 0,

	row_dehighlight: function(row_id) {
		var i; for (i = 0; i < 4; i++) {
			this.draw_cell(i, this.play_position, this.patterns_display[i], 1);
		}
		inputs.focus(this);
	},

	row_highlight: function(row_id) {
		var i; for (i = 0; i < 4; i++) {
			this.draw_cell(i, this.play_position, this.patterns_display[i], 2);
		}
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
	display: '---',
	value: 0,
	x_origin: 2,
	y_origin: 6,
	x: 3,
	y: 10,
}
