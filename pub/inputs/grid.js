inputs.types.grid = {

	cell_advance: function(field, direction) {
		inputs.blur(field);
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
		this.cell_update(field);
		inputs.focus(field);
	},

	draw_all: function(field) {
		for (var x = field.width-1; x >= 0; x--) {
			this.draw_column(field, x);
		}
	},

	cell_update: function(field, style='blur') {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// call inputs on_update if defined
		if (typeof field.on_update == 'function') field.on_update();
		// update cell display
		field.display = this.get_cell_display(field, field.cell.x, field.cell.y);
		// position the cell coorectly
		this.get_cell_position(field, field.cell.x, field.cell.y).map((val, index) => {
			if (index == 0) field.x = val;
			else field.y = val;
		});
		inputs.draw_display(field, style);
	},

	draw_column: function(field, x) {
		field.cell.x = x;
		for (var y = field.height-1; y >= 0; y--) {
			field.cell.y = y;
			this.cell_update(field);
		}
	},

	draw_row: function(field, y) {
		field.cell.y = y;
		for (var x = field.width-1; x >= 0; x--) {
			field.cell.x = x;
			this.cell_update(field);
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
		field.cell = {
			x: 0,
			y: 0,
			display: field.data[field.cell.x][field.cell.y],
		};
		this.draw_all(field);
	},

	on_key: function(field, key) {
		// tab out
		if (key.code == 9) return;
		// cell value adjustment
		if (key.label == 'CONTROL_' + SPKEY.ARROW_DOWN ||
			key.label == 189) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {;
				field.data[field.cell.x][field.cell.y]--;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_UP ||
			key.label == 187) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {;
				field.data[field.cell.x][field.cell.y]++;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_LEFT ||
			key.label == 'SHIFT_189') {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min) {
					field.data[field.cell.x][field.cell.y] = field.value_min;
				}
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_RIGHT ||
			key.label == 'SHIFT_187') {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y] += 16;
				if (field.data[field.cell.x][field.cell.y] > field.value_max) {
					field.data[field.cell.x][field.cell.y] = field.value_max;
				}
			}
		}
		// grid navigate
		else if (key.label == SPKEY.ARROW_DOWN) {
			this.cell_advance(field, 'down');
		}
		else if (key.label == SPKEY.ARROW_LEFT) {
			this.cell_advance(field, 'left');
		}
		else if (key.label == SPKEY.ARROW_RIGHT) {
			this.cell_advance(field, 'right');
		}
		else if (key.label == SPKEY.ARROW_UP) {
			this.cell_advance(field, 'up');
		}
		// handle hex number keys
		else if (field.cell_type == 'hex' && HEXKEY.includes(key.code)) {
			field.data[field.cell.x][field.cell.y] = HEXKEY.indexOf(key.code);
			field.on_update();
			this.cell_update(field);
			this.cell_advance(field, field.cell_advance_behavior);
		}
		// call custom key handler
		else if (typeof field.on_key === 'function' && field.on_key() == true) this.cell_advance(field);
		// display cursor updates
		this.cell_update(field) & inputs.focus(field);
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
