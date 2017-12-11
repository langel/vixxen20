inputs.types.grid = {

	cell_update: function(field) {
	},

	draw_all: function(field) {
		for (var x = field.width-1; x >= 0; x--) {
			this.draw_column(field, x);
		}
	},

	draw_cell: function(field) {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// handle hex display
		if (field.cell_type == 'hex') {
			field.display = vixxen.display.hex(field.data[field.cell.x][field.cell.y]);
			field.display = vixxen.display.pad(field.display, field.cell_width, '0');
		}
		// handle decimal/default display
		else {
			field.display = vixxen.display.pad(field.value, 3, ' ');
		}
		field.x = (field.cell.x == 0) ? field.origin_x : field.origin_x + field.cell.x * (field.cell_width + field.cell_margin);
		field.y = field.origin_y + field.cell.y;
		inputs.blur(field);
	},

	draw_column: function(field, x) {
		field.cell.x = x;
		for (var y = field.height-1; y >= 0; y--) {
			field.cell.y = y;
			field.display = field.data[x][y];
			this.draw_cell(field);
		}
	},

	draw_row: function(field, y) {
		field.y = y;
		for (var x = field.width-1; x >= 0; x--) {
			field.x = x;
			field.display = field.data[x][y];
			this.draw_cell(field);
		}
	},

	get_cell_pos: function(field, x, y) {
		x = (field.x == 0) ? field.origin_x : field.origin_x + x * (field.cell_width + field.cell_margin);
		y = field.origin_y + y;
		return {x:x, y:y};
	},

	init: function(field) {
		field.cell = {x:0, y:0};
		field.origin_x = field.x;
		field.origin_y = field.y;
		field.data = [];
		// run custom init
		if (typeof field.on_init == 'function') field.on_init();
		// default init function
		else for (var x = field.width; x > 0; x--) {
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
console.log(field);
		this.draw_all(field);
	},

	on_key: function(field, key) {
		if (key.label == 'CONTROL_' + SPKEY.ARROW_DOWN ||
			key.code == 189) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {;
				field.data[field.cell.x][field.cell.y]--;
				this.draw_cell(field);
				inputs.focus(field);
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_UP ||
			key.code == 187) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {;
				field.data[field.cell.x][field.cell.y]++;
				this.draw_cell(field);
				inputs.focus(field);
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_LEFT ||
			key.label == 'SHIFT_189') {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min)
					field.data[field.cell.x][field.cell.y] = field.value_min;
				this.draw_cell(field);
				inputs.focus(field);
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_RIGHT ||
			key.label == 'SHIFT_187') {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y] += 16;
				if (field.data[field.cell.x][field.cell.y] > field.value_max)
					field.data[field.cell.x][field.cell.y] = field.value_max;
				this.draw_cell(field);
				inputs.focus(field);
			}
		}
		else if (key.label == SPKEY.ARROW_DOWN) {
			inputs.blur(field);
			field.cell.y++;
			if (field.cell.y == field.height) field.cell.y = 0;
			field.value = field.data[field.cell.x][field.cell.y];
			this.draw_cell(field);
			inputs.focus(field);
		}
		else if (key.label == SPKEY.ARROW_LEFT) {
			inputs.blur(field);
			field.cell.x--;
			if (field.cell.x < 0) field.cell.x = 0;
			field.value = field.data[field.cell.x][field.cell.y];
			this.draw_cell(field);
			inputs.focus(field);
		}
		else if (key.label == SPKEY.ARROW_RIGHT) {
			inputs.blur(field);
			field.cell.x++;
			if (field.cell.x == field.width) field.cell.x = 0;
			field.value = field.data[field.cell.x][field.cell.y];
			this.draw_cell(field);
			inputs.focus(field);
		}
		else if (key.label == SPKEY.ARROW_UP) {
			inputs.blur(field);
			field.cell.y--;
			if (field.cell.y < 0) field.cell.y = field.height-1;
			field.value = field.data[field.cell.x][field.cell.y];
			this.draw_cell(field);
			inputs.focus(field);
		}

		// call inputs on_update if defined
		if (typeof field.on_update == 'function') {
			field.on_update();
		}
	},

	row_dehighlight: function(field, row) {
	},

	row_highlight: function(field, row) {
	},

	set_block: function(field, x1, y1, x2, y2) {
	},
}
