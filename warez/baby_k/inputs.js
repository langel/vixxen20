var baby_k_inputs = {

	
	global_keys: [{
		// space
		// pause song
		key: 32,
		on_update: function() {
			baby_k.pause = !baby_k.pause;
			if (baby_k.pause == true) baby_k.song_pause();
			else baby_k.song_play();
		}
	},{
		// backslash '\'
		// toggle root octave
		key: 220,
		on_update: function() {
			if (baby_k.octave == 0) baby_k.octave = 1;
			else baby_k.octave = 0;
			inputs.set_value('OCTAVE', baby_k.octave);
		}
	}],


	init: function() {

		this.fields = [{

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
			value_default: 0,
			value_min: 0,
			value_max: 255,

			cell_display: function(value, x, y) {
				var display, note = baby_k_note_values.indexOf(value);
				if (note !== -1) 
					display = baby_k_note_names[note%12] + '' + (Math.floor(note/12) + x);
				else if (value > 127) display = value;
				else if (value < baby_k_note_specials.length) display = baby_k_note_specials[value];
				else display = this.value;
				display = kernel.display.pad(display, this.cell_width, ' ');
				return display;
			},

			load_patterns: function(pattern_order_row) {
				this.data = [];
				var i;
				for (i = 0; i < 4; i++) {
					var pattern_id = baby_k.song.pattern_order[pattern_order_row][i];
					this.data.push((pattern_id != 255) ? baby_k.song.patterns[pattern_id] : baby_k_new_pattern);
				};
				inputs.types.grid.draw_all(inputs.get_field_by_label('PATTERN'));
			},

			on_init: function() {
				this.song_grid = inputs.get_field_by_label('SONG');
				this.load_patterns(0);
			},

			on_key: function(key) {
				var advance = 'down';
				// note inputs
				var note = baby_k_note_keycodes.indexOf(parseInt(key.code, 10));
				if (note != -1) {
					if (baby_k.octave > 0) note += baby_k.octave * 12;
					this.value = baby_k_note_values[note];
					if (typeof this.value == 'undefined') {
						if (note == 38) this.value = 245;
						if (note == 39) this.value = 250;
						if (note == 40) this.value = 255;
					}
				}
				// special note inputs
				else if (key.input == 'Delete') this.value = 0;
				else if (key.input == '1') this.value = 1;
				else if (key.input == '`') this.value = 2;
				else if (key.input == '~') this.value = 3;
				// cursor does not advance with keys below
				else {
					var advance = false;
					// decrease pattern number
					if (key.label == SPKEY.DASH) {
					}
					// increase pattern number
					else if (key.label == SPKEY.EQUAL) {
					}
					// decrease pattern number by 16
					else if (key.label == 'SHIFT_' + SPKEY.DASH) {
					}
					// increase pattern number by 16
					else if (key.label == 'SHIFT_' + SPKEY.EQUAL) {
					}
					// decrease pattern number across row
					else if (key.label == 'CONTROL_' + SPKEY.DASH) {
					}
					// increase pattern number across row
					else if (key.label == 'CONTROL_' + SPKEY.EQUAL) {
					}
					// decrease pattern number by 16 across row
					else if (key.label == 'CONTROL_SHIFT_' + SPKEY.DASH) {
					}
					// increase pattern number by 16 across row
					else if (key.label == 'CONTROL_SHIFT_' + SPKEY.EQUAL) {
					}
				}
				this.data[this.cell.x][this.cell.y] = this.value;
				var pattern_id = baby_k.song.pattern_order[baby_k.pattern_order_pos][this.cell.x];
				baby_k.song.patterns[pattern_id][this.cell.y] = this.value;
				return advance;
			},
		},	{

			label: 'SONG',
			type: 'grid',
			cell_width: 2,
			cell_height: 1,
			cell_margin: 1,
			cell_type: 'hex',
			cell_value: 0,
			width: 4,
			height: 16,
			x: 19,
			y: 10,
			value_default: 255,
			value_min: 0,
			value_max: 127,

			cell_display: function(value) {
				if (value >= 128) return '--';
				return kernel.display.pad(kernel.display.hex(value), this.cell_width, '0');
			},
			on_init: function() {
				this.pattern_grid = inputs.get_field_by_label('PATTERN');
				this.data = [];
				for (var x = 0; x < 4; x++) {
					var column = [];
					for (var y = 0; y < 128; y++) {
						column.push(baby_k.song.pattern_order[y][x]);
					}
					this.data.push(column);
				}
			},
			on_key: function() {
				var advance = false;
				return false;
			},
			on_update: function() {
				// put new value in song data
				baby_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
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
				baby_k.song.speed_table[this.cell.y] = this.value;
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
				baby_k.song.volume_table[this.cell.y] = this.value;
			},

		}, {

			label: 'OCTAVE',
			type: 'range',
			on_update: function() {
				baby_k.octave = this.value;
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
				baby_k.song.title = this.string;
			},
			value: baby_k_new_song.title,
			length: 16,
			x: 2,
			y: 3,
		},	{

			label: 'ARTIST',
			type: 'string',
			on_update: function() {
				baby_k.song.artist = this.string;
			},
			value: baby_k_new_song.artist,
			length: 16,
			x: 2,
			y: 4,
		},	{

			label: 'COPY INFO',
			type: 'string',
			on_update: function() {
				baby_k.song.copy_info = this.string;
			},
			value: baby_k_new_song.copy_info,
			length: 16,
			x: 2,
			y: 5,
		}]
	}

};
