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
		y: { length: 127, pos: 0 }
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

	on_key: function() {
		var advance = false;
		return advance;
	},

	on_update: function() {
		// put new value in song data
		baby_k.song.pattern_order[this.cell.y][this.cell.x] = this.value;
		// update song row in hud
		if (!baby_k.follow_mode) {
			if (typeof this.cell.y !== 'undefined') {
				baby_k.update_song_row_display(this.cell.y);
			}
		}
	}
}
