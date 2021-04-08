let baby_k_input_pattern = {

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
		var display, note = baby_k_scales[baby_k.tuning].notes.indexOf(value);
		if (note !== -1 && value !== 0) 
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
		var note = baby_k_note_keycodes.indexOf(parseInt(key.label, 10));
		if (note != -1) {
			if (baby_k.octave > 0) note += baby_k.octave * 12;
			this.value = baby_k_scales[baby_k.tuning].notes[note];
			if (typeof this.value == 'undefined') {
				if (note == 38) this.value = 245;
				if (note == 39) this.value = 250;
				if (note == 40) this.value = 255;
			}
		}
		// special note inputs
		// note off
		else if (key.input == '1') this.value = 1;
		// next pattern
		else if (key.input == '`') this.value = 2;
		// end song
		else if (key.input == '~') this.value = 3;
		// cursor does not advance with keys below
		else {
			var advance = false;
			// ADJUST PATTERN NUMBERS KEYCOMBOS
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
		// only update cell value if a value is found
		if (typeof this.value !== "undefined") {
			this.data[this.cell.x][this.cell.y] = this.value;
			var pattern_id = baby_k.song.pattern_order[baby_k.pattern_order_pos][this.cell.x];
			baby_k.song.patterns[pattern_id][this.cell.y] = this.value;
		}
		return advance;
	}	
};
