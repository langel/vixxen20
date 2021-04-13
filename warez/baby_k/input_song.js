let baby_k_input_song = {

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
	scroll: {
		x: { length: 4, pos: 0 },
		y: { length: baby_k.song_max_length, pos: 0 }
	},

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

	get_current_row: () => {
		return baby_k.song_pos;
	},

	get_next_row: () => {
		let row = baby_k.song_pos;
		row++;
		let pattern_data = baby_k.song.pattern_order[row];
		let pop = 0;
		for (let i = 0; i < 4; i++) {
			if (pattern_data[i] != 255) pop++;
		}
		if (pop > 0) return row;
		// XXX should rewind song data instead
		else return 0;
	},

	on_key: function() {
		var advance = false;
		return advance;
	},

	on_update: function() {
		// put new value in song data
		baby_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
		// update song row in hud
		if (!baby_k.follow_mode || baby_k.pause) {
			if (typeof this.cell.y !== 'undefined') {
				this.set_current_row(this.cell.y);
			}
		}
		if (baby_k.follow_mode && !baby_k.pause) {
			this.cell.y = baby_k.song_pos;
		}
	},

	set_current_row: function(row) {
		let old_row = baby_k.song_pos
		inputs.types.grid.row_dehighlight(baby_k.song_grid, baby_k.song_pos);
		baby_k.update_song_row_display(row);
		baby_k.song_pos = row;
		inputs.types.grid.row_highlight(baby_k.song_grid, baby_k.song_pos);
	}
}
