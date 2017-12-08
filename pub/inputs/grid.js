inputs.types.grid = {

	cell_advance: function(field) {
		inputs.blur(field);
		field.cell.y++;
		if (field.cell.y == field.height) field.cell.y = 0;
		field.value = field.data[field.cell.x][field.cell.y];
		this.cell_position_update(field);
		inputs.focus(field);
	},

	cell_position_update: function(field) {
		field.x = (field.cell.x == 0) ? field.origin_x : field.origin_x + field.cell.x * (field.cell_width + field.cell_margin);
		field.y = field.origin_y + field.cell.y;
	},

	cell_update: function(field) {
		field.value = field.data[field.cell.x][field.cell.y];
		field.display = vixxen.display.hex(field.value);
		inputs.blur(field);
	},

	draw_all: function(field) {
		for (var x = field.width-1; x >= 0; x--) {
			this.draw_column(field, x);
		}
	},

	draw_cell: function(field) {
		field.display = vixxen.display.hex(field.data[field.cell.x][field.cell.y]);
		field.x = (field.cell.x == 0) ? field.origin_x : field.origin_x + field.cell.x * (field.cell_width + field.cell_margin);
		field.y = field.origin_y + field.cell.y;
		inputs.blur(field);
	},

	draw_column: function(field, x) {
		field.cell.x = x;
		for (var y = field.height-1; y >= 0; y--) {
			field.cell.y = y;
			this.cell_update(field);
		}
	},

	draw_row: function(field, y) {
		field.y = y;
		for (var x = field.width-1; x >= 0; x--) {
			field.x = x;
			this.cell_update(field);
		}
	},

	init: function(field) {
		field.cell = {x:0, y:0};
		field.origin_x = field.x;
		field.origin_y = field.y;
		field.data = [];
		for (var x = field.width; x > 0; x--) {
			var column = [];
			for (var y = field.height; y > 0; y--) {
				column.push(field.cell_value);
			}
			field.data.push(column);
		}
		field.cell = {
			x: 0,
			y: 0,
			display: field.data[field.cell.x][field.cell.y],
		};

		this.draw_all(field);
	},

	on_key: function(field, key) {
		// cell value adjustment
		if (key.label == 'CONTROL_' + SPKEY.ARROW_DOWN) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {;
				field.data[field.cell.x][field.cell.y]--;
				this.cell_update(field);
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_UP) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {;
				field.data[field.cell.x][field.cell.y]++;
				this.cell_update(field);
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_LEFT) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min) {
					field.data[field.cell.x][field.cell.y] = field.value_min;
					this.cell_update(field);
				}
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_RIGHT) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y] += 16;
				if (field.data[field.cell.x][field.cell.y] > field.value_max) {
					field.data[field.cell.x][field.cell.y] = field.value_max;
					this.cell_update(field);
				}
			}
		}
		// grid navigate
		else if (key.label == SPKEY.ARROW_DOWN) {
			this.cell_advance(field);
		}
		else if (key.label == SPKEY.ARROW_LEFT) {
			inputs.blur(field);
			field.cell.x--;
			if (field.cell.x < 0) field.cell.x = 0;
			field.value = field.data[field.cell.x][field.cell.y];
			this.cell_position_update(field);
			inputs.focus(field);
		}
		else if (key.label == SPKEY.ARROW_RIGHT) {
			inputs.blur(field);
			field.cell.x++;
			if (field.cell.x == field.width) field.cell.x = 0;
			field.value = field.data[field.cell.x][field.cell.y];
			this.cell_position_update(field);
			inputs.focus(field);
		}
		else if (key.label == SPKEY.ARROW_UP) {
			inputs.blur(field);
			field.cell.y--;
			if (field.cell.y < 0) field.cell.y = field.height-1;
			field.value = field.data[field.cell.x][field.cell.y];
			this.cell_position_update(field);
			inputs.focus(field);
		}
		// call custom key handler
		else if (typeof field.on_key === 'function') {
			field.on_key(key);
		}
	},

	row_dehighlight: function(field, row) {
	},

	row_highlight: function(field, row) {
	},

	set_block: function(field, x1, y1, x2, y2) {
	},
}
