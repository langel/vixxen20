var beta_k_inputs = {

	
	global_keys: [{
		// space
		// pause song
		key: 32,
		on_update: function() {
			beta_k.pause = !beta_k.pause;
			if (beta_k.pause == true) beta_k.song_pause();
			else beta_k.song_play();
		}
	},{
		// backslash '\'
		// toggle root octave
		key: 220,
		on_update: function() {
			if (beta_k.octave == 0) beta_k.octave = 1;
			else beta_k.octave = 0;
			inputs.set_value('OCTAVE', beta_k.octave);
		}
	}],


	fields: [{

		label: 'PATTERN',
		type: 'grid',
		cell_width: 3,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'custom',
		cell_value: 0,
		width: 4,
		height: 16,
		x: 2,
		y: 10,
		value_min: 0,
		value_max: 255,

		cell_display: function(value) {
			var display, note = beta_k_note_values.indexOf(value);
			if (note !== -1) 
			display = beta_k_note_names[note%12] +
			'' + 
			(Math.floor(note/12) + this.cell.x);
			else if (value > 127) display = value;
			else if (value < beta_k_note_specials.length) display = beta_k_note_specials[value];
			else display = this.value;
			display = vixxen.display.pad(display, this.cell_width, ' ');
			return display;
		},
		on_init: function() {
			this.song_grid = inputs.get_field_by_label('SONG');
			this.data = [];
			// XXX this is crap
			var i;
			for (i = 0; i < 4; i++) {
				this.data.push(beta_k.song.patterns[i]);
			};
		},
		on_key: function(key) {
			var old_value = this.value;
			var note = beta_k_note_keycodes.indexOf(parseInt(key.code, 10));
			if (note != -1) {
				if (beta_k.octave > 0) note += beta_k.octave * 12;
				this.value = beta_k_note_values[note];
			}
			else if (key.input == 'Delete') this.value = 0;
			else if (key.input == '1') this.value = 1;
			else if (key.input == '`') this.value = 2;
			else if (key.input == '~') this.value = 3;
			this.data[this.cell.x][this.cell.y] = this.value;
			beta_k.song.patterns[this.cell.x][this.cell.y] = this.value;
			if (this.value !== old_value) return 'down';
			else return false;
			/* XXX code from old pattern grid to clean up pattern column
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
			*/
		},
	},	{

		label: 'SONG',
		type: 'grid',
		cell_width: 2,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'custom',
		cell_value: 0,
		width: 4,
		height: 16,
		x: 19,
		y: 10,
		value_min: 0,
		value_max: 127,

		cell_display: function(value) {
			if (value > 128) return '--';
			return vixxen.display.pad(vixxen.display.hex(value), this.cell_width, '0');
		},
		on_init: function() {
			this.pattern_grid = inputs.get_field_by_label('PATTERN');
			this.data = [];
			for (var x = 0; x < 4; x++) {
				var column = [];
				for (var y = 0; y < 128; y++) {
					column.push(beta_k.song.pattern_order[y][x]);
				}
				this.data.push(column);
			}
		},
		on_key: function(key) {
			if (HEXKEY.includes(key.code)) this.data[this.cell.x][this.cell.y] = HEXKEY.indexOf(key.code);
			beta_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
			console.log(this.value);
			return 'down';
		},
	}, {

		label: 'SPEED',
		type: 'grid',
		cell_width: 1,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'hex',
		cell_value: 5,
		width: 1,
		height: 16,
		x: 33,
		y: 10,
		value_min: 1,
		value_max: 15,
		on_update: function() {
			beta_k.song.speed_table[this.cell.y] = this.value;
		},

	},	{

		label: 'VOLUME',
		type: 'grid',
		cell_width: 1,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'hex',
		cell_value: 7,
		width: 1,
		height: 16,
		x: 37,
		y: 10,
		value_min: 0,
		value_max: 15,
		on_update: function() {
			beta_k.song.volume_table[this.cell.y] = this.value;
		},

	}, {

		label: 'OCTAVE',
		type: 'range',
		on_update: function() {
			beta_k.octave = this.value;
			this.display = this.label + '  ' + this.value;
		},
		value: 0,
		value_min: 0,
		value_max: 1,
		x: 20,
		y: 5
	},	{

		label: 'TITLE',
		type: 'string',
		on_update: function() {
			beta_k.song.title = this.string;
		},
		value: beta_k_new_song.title,
		length: 16,
		x: 2,
		y: 3,
	},	{

		label: 'ARTIST',
		type: 'string',
		on_update: function() {
			beta_k.song.artist = this.string;
		},
		value: beta_k_new_song.artist,
		length: 16,
		x: 2,
		y: 4,
	},	{

		label: 'COPY INFO',
		type: 'string',
		on_update: function() {
			beta_k.song.copy_info = this.string;
		},
		value: beta_k_new_song.copy_info,
		length: 16,
		x: 2,
		y: 5,
	}]
		
};
