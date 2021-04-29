let baby_k_input_song = {

	label: 'SONG',
	type: 'grid',
	cell_width: 2,
	cell_height: 1,
	cell_margin: 1,
	cell_type: 'hex',
	cell_blur_pose: true,
	value_default: 0,
	width: 4,
	height: 16,
	x: 19,
	y: 10,
	value_default: 255,
	value_min: 0,
	value_max: 127,
	scroll: {
		x: { length: 4, pos: 0 },
		y: { length: baby_k.song_max_length, pos: 0 }
	},

	cell_display: function(value) {
		if (value >= 128) return '--';
		return kernel.display.pad(kernel.display.hex(value), this.cell_width, '0');
	},

	get_current_row: () => {
		return baby_k.song_pos;
	},

	get_next_row: () => {
		let row = baby_k.song_pos;
		row++;
		if (row >= baby_k.song_max_length) row = 0;
		let pattern_data = baby_k.song.pattern_order[row];
		let pop = 0;
		for (let i = 0; i < 4; i++) {
			if (pattern_data[i] != 255) pop++;
		}
		if (pop > 0) return row;
		// XXX should rewind song data instead
		else return 0;
	},

	on_init: function() {
		this.pattern_grid = inputs.get_field_by_label('PATTERN');
		this.cell.x = 0;
		this.cell.y = 0;
		this.data = [];
		for (var x = 0; x < 4; x++) {
			var column = [];
			for (var y = 0; y < 128; y++) {
				column.push(baby_k.song.pattern_order[y][x]);
			}
			this.data.push(column);
		}
	},

	on_key: function(key) {
		var advance = false;
		this.on_key_pattern_adjust(this.cell.x, this.cell.y, key);
		return advance;
	},

	on_key_pattern_adjust: function(x, y, key) {
		// ADJUST PATTERN NUMBERS KEYCOMBOS
		// decrease pattern number
		if (key.label == SPKEY.DASH
		|| key.label == SPKEY.NUM_MINUS) {
			this.set_pattern_id_by_adjustment(x, y, -1);
		}
		// increase pattern number
		else if (key.label == SPKEY.EQUAL
		|| key.label == SPKEY.NUM_PLUS) {
			this.set_pattern_id_by_adjustment(x, y, 1);
		}
		// decrease pattern number by 16
		else if (key.label == 'CONTROL_' + SPKEY.DASH
		|| key.label == 'CONTROL_' + SPKEY.NUM_MINUS) {
			this.set_pattern_id_by_adjustment(x, y, -16);
		}
		// increase pattern number by 16
		else if (key.label == 'CONTROL_' + SPKEY.EQUAL
		|| key.label == 'CONTROL_' + SPKEY.NUM_PLUS) {
			this.set_pattern_id_by_adjustment(x, y, 16);
		}
		// decrease pattern number across row
		else if (key.label == 'SHIFT_' + SPKEY.DASH
		|| key.label == 'SHIFT_' + SPKEY.NUM_MINUS) {
			this.set_pattern_row_by_adjustment(y, -1);
		}
		// increase pattern number across row
		else if (key.label == 'SHIFT_' + SPKEY.EQUAL
		|| key.label == 'SHIFT_' + SPKEY.NUM_PLUS) {
			this.set_pattern_row_by_adjustment(y, 1);
		}
		// decrease pattern number by 16 across row
		else if (key.label == 'CONTROL_SHIFT_' + SPKEY.DASH
		|| key.label == 'CONTROL_SHIFT_' + SPKEY.NUM_MINUS) {
			this.set_pattern_row_by_adjustment(y, -16);
		}
		// increase pattern number by 16 across row
		else if (key.label == 'CONTROL_SHIFT_' + SPKEY.EQUAL
		|| key.label == 'CONTROL_SHIFT_' + SPKEY.NUM_PLUS) {
			this.set_pattern_row_by_adjustment(y, 16);
		}
	},

	on_update: function() {
		// put new value in song data
		if (typeof this.value !== 'undefined') {
			baby_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
		}
		// update song row in hud
		if (!baby_k.follow_mode || baby_k.pause) {
			if (typeof this.cell.y !== 'undefined') {
				this.set_current_row(this.cell.y);
			}
		}
		if (baby_k.follow_mode && !baby_k.pause) {
			this.cell.y = baby_k.song_pos;
		}
		if (baby_k.follow_mode && baby_k.pattern_grid.cell) {
			baby_k.pattern_grid.cell.x = this.cell.x;
		}
	},

	set_current_row: function(row) {
		baby_k.song_pos = row;
		baby_k.update_song_row_display(row);
		baby_k.pattern_grid.load_patterns(row);
		if (row < this.scroll.y.pos) this.scroll.y.pos = row;
		inputs.types.grid.row_highlight(baby_k.song_grid, baby_k.song_pos);
		this.draw_this = true;
	},

	set_pattern_id: function(id, x, y) {
		let cell_x = this.cell.x;
		let cell_y = this.cell.y;
		// put new value in song data
		this.value = id;
		this.cell.x = x;
		this.cell.y = y;
		console.log(id);
		baby_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
		this.data[this.cell.x][this.cell.y] = this.value;
		this.cell.x = cell_x;
		this.cell.y = cell_y;
		this.value = this.data[cell_x][cell_y];
		// update pattern grid
		baby_k.pattern_grid.load_patterns(y);
	},

	set_pattern_id_by_adjustment(x, y, amount) {
		let id = this.data[x][y];
		if (id == 255) id = amount;
		else id += amount;
		id = Math.max(id, 0);
		id = Math.min(id, baby_k.pattern_max_id);
		this.set_pattern_id(id, x, baby_k.song_pos);
	},

	set_pattern_row_by_adjustment(y, amount) {
		for (let x = 0; x < 4; x++) {
			this.set_pattern_id_by_adjustment(x, y, amount);	
		}
	}
}
