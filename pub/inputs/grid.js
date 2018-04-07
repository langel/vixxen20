inputs.types.grid = {

	cell_advance: function(field, direction) {
		inputs.blur(field);
		if (direction !== false) field.hexkeycount = 0;
		if (direction == 'down') {
			field.cell.y++;
			if (field.cell.y == field.height) field.cell.y = 0;
		}
		if (direction == 'left') {
			field.cell.x--;
			if (field.cell.x < 0) field.cell.x = field.width-1;
		}
		if (direction == 'right') {
			field.cell.x++;
			if (field.cell.x == field.width) field.cell.x = 0;
		}
		if (direction == 'up') {
			field.cell.y--;
			if (field.cell.y < 0) field.cell.y = field.height-1;
		}
		this.cell_update(field, 'blur');
		inputs.focus(field);
	},

	// visually update cell w/o cursor
	cell_draw: function(field, x, y, style) {
		field.cell.display = this.get_cell_display(field, x, y);
		var pos = this.get_cell_position(field, x, y);
		inputs.draw(pos[0], pos[1], field.cell.display, style);	
	},

	cell_update: function(field, style) {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// call inputs on_update if defined
		if (typeof field.on_update == 'function') field.on_update();
		// update cursor position
		this.get_cell_position(field, field.cell.x, field.cell.y).map((val, index) => {
			if (index == 0) field.x = val;
			else field.y = val;
		});
		// update cell display
		this.cell_draw(field, field.cell.x, field.cell.y, style);
	},

	draw_all: function(field) {
		var x = field.cell.x;
		var y = field.cell.y;
		var old_cursor = field.cell;
		// draw all grid columns
		for (var c = field.width - 1; c >= 0; c--) {
			this.draw_column(field, c);
		}
		// highlight cursor
		field.cell.x = x;
		field.cell.y = y;
		this.cell_update(field, 'focus');
	},

	draw_column: function(field, x) {
		for (var y = field.height - 1; y >= 0; y--) {
			this.cell_draw(field, x, y, 'blur');
		}
	},

	draw_row: function(field, y) {
		for (var x = field.width - 1; x >= 0; x--) {
			this.cell_draw(field, x, y, 'blur');
		}
	},
	
	get_cell_display: function(field, x, y) {
		var value = field.data[x][y];
		// handle custom cell display
		if (field.cell_type == 'custom') {
			return field.cell_display(value);
		}
		// handle hex cell display
		else if (field.cell_type == 'hex') {
			return vixxen.display.pad(vixxen.display.hex(value), field.cell_width, '0');
		}
		// handle alphanumeric default cell display
		else {
			return vixxen.display.pad(value, field.cell_width, ' ');
		}
	},

	get_cell_position: function(field, x, y) {
		// returns [x, y]
		return [
			(x == 0) ? field.origin_x : field.origin_x + x * (field.cell_width + field.cell_margin),
			field.origin_y + y
		];
	},

	init: function(field) {
		field.cell = {x:0, y:0};
		field.origin_x = field.x;
		field.origin_y = field.y;
		field.data = [];
		field.cell_advance_behavior = 'down';
		field.row_highlighted = 0;
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
		field.cell.display = field.data[field.cell.x][field.cell.y];
		this.draw_all(field);
	},

	on_key: function(field, key) {
		// flag for cell advancement
		var advance = false;
		// tab out
		if (key.code == 9) return;
		// grid navigate
		else if (key.label == SPKEY.ARROW_DOWN) {
			advance = 'down';
		}
		else if (key.label == SPKEY.ARROW_LEFT) {
			advance = 'left';
		}
		else if (key.label == SPKEY.ARROW_RIGHT) {
			advance = 'right';
		}
		else if (key.label == SPKEY.ARROW_UP) {
			advance = 'up';
		}
		else if (key.label == SPKEY.HOME) {
			inputs.blur(field);
			field.cell.y = 0;
		}
		else if (key.label == SPKEY.END) {
			inputs.blur(field);
			field.cell.y = field.height-1;
		}
		else if (key.label == SPKEY.PAGE_DOWN) {
			inputs.blur(field);
			field.cell.y += 4;
			if (field.cell.y >= field.height) field.cell.y = field.height-1;
		}
		else if (key.label == SPKEY.PAGE_UP) {
			inputs.blur(field);
			field.cell.y -= 4;
			if (field.cell.y <= 0) field.cell.y = 0;
		}
		// cell value adjustment
		else if (key.label == 'SHIFT_' + SPKEY.ARROW_DOWN) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {;
				field.data[field.cell.x][field.cell.y]--;
			}
		}
		else if (key.label == 'SHIFT_' + SPKEY.ARROW_UP) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {;
				field.data[field.cell.x][field.cell.y]++;
			}
		}
		else if (key.label == 'SHIFT_' + SPKEY.ARROW_LEFT) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min) {
					field.data[field.cell.x][field.cell.y] = field.value_min;
				}
			}
		}
		else if (key.label == 'SHIFT_' + SPKEY.ARROW_RIGHT) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y] += 16;
				if (field.data[field.cell.x][field.cell.y] > field.value_max) {
					field.data[field.cell.x][field.cell.y] = field.value_max;
				}
			}
		}
		// handle hex number keys (currently limited to 8bit values)
		else if (field.cell_type == 'hex' && HEXKEY.includes(key.code)) {
			if (field.hexkeycount == 0) {
				field.hexkeycount = field.cell_width;
			}
			var value = field.data[field.cell.x][field.cell.y];
			var input_value = HEXKEY.indexOf(key.code);
			field.hexkeycount--;
			// XXX more conditionals if we go 16bit hex values
			if (field.hexkeycount == 1) {
				//value = (value & 0b00001111) + (input_value << 4);
				value = input_value << 4;
			}
			if (field.hexkeycount == 0) {
				value = (value & 0b11110000) + input_value;
				advance = field.cell_advance_behavior;
			}
			if (value > field.value_max) value = field.value_max;
			else if (value < field.value_min) value = field.value_min;
			field.data[field.cell.x][field.cell.y] = value;
		}
		// cell deletions
		else if (key.code == 190) {
			if (typeof field.value_default != 'undefined') {
				advance = 'down';
				value = field.value_default;
				field.data[field.cell.x][field.cell.y] = value;
			}
		}
		// call custom key handler
		else if (typeof field.on_key === 'function') {
			advance = field.on_key(key);
		}
		// display cursor updates
		this.cell_update(field, 'focus');
		// advance cell if defined
		this.cell_advance(field, advance);
	},

	row_dehighlight: function(field, row) {
		for (var i = 0; i < field.width; i++) {
			var pos = this.get_cell_position(field, i, row);
			var display = this.get_cell_display(field, i, row);
			inputs.draw(pos[0], pos[1], display, 'blur');
		}
	},

	row_highlight: function(field, row) {
		this.row_dehighlight(field, field.row_highlighted);
		field.row_highlighted = row;
		for (var i = 0; i < field.width; i++) {
			var pos = this.get_cell_position(field, i, row);
			var display = this.get_cell_display(field, i, row);
			inputs.draw(pos[0], pos[1], display, 'highlight');
		}
		if (inputs.field_index == inputs.get_field_by_label(field.label).index) inputs.focus(field);
	},

	set_block: function(field, x1, y1, x2, y2) {
	},
}
