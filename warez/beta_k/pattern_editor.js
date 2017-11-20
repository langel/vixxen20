

var beta_k_pattern_editor = {

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
			if (r !== 0) while (song.patterns[this.channel][r] === old_value || song.patterns[this.channel][r] === 1) {
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
	display: '---',
	value: 0,
	x_origin: 2,
	y_origin: 6,
	x: 3,
	y: 10,
}
