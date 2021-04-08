inputs.types.grid = {

	cell_advance: function(field, direction) {
		if (field.cell.y == field.row_highlighted) {
			inputs.highlight(field);
		}
		else {
			inputs.blur(field);
		}
		if (direction !== false) field.hexkeycount = 0;
		if (direction == 'down') {
			field.cell.y++;
			if (field.cell.y - field.scroll.y.pos >= field.height) {
				field.scroll.y.pos++;
				if (field.cell.y >= field.scroll.y.length) {
					field.scroll.y.pos = 0;
					field.cell.y = 0;
				}
				this.draw_all(field);
			}
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
			if (field.cell.y < 0) {
				field.scroll.y.pos = field.scroll.y.length - field.height + 1;
				field.cell.y = field.scroll.y.length;
				this.draw_all(field);
			}
			else if (field.scroll.y.pos > field.cell.y) {
				field.scroll.y.pos--;
				this.draw_all(field);
			}
		}
		this.cell_update(field);
		inputs.focus(field);
	},

	cell_update: function(field, style='blur') {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// call inputs on_update if defined
		if (typeof field.on_update == 'function') field.on_update();
		// update cell display
		field.display = this.get_cell_display(field, field.cell.x, field.cell.y);
		// position the cell correctly
		this.get_cell_position(field, field.cell.x, field.cell.y).map((val, index) => {
			if (index == 0) field.x = val;
			else field.y = val;
		});
		inputs.draw_display(field, style);
	},

	draw_all: function(field) {
		var x = field.cell.x;
		var y = field.cell.y;
		var old_cursor = field.cell;
		for (var c = field.width-1; c >= 0; c--) {
			field.cell.x = c;
			for (var r = field.height-1; r >= 0; r--) {
				field.cell.y = r;
				this.cell_update(field, 'blur');
			}
		}
		field.cell.x = x;
		field.cell.y = y;
		if (inputs.get_current_field().label == field.label) {
			this.cell_update(field, 'focus');
		}
	},

	draw_column: function(field, x) {
		var x = field.cell.x;
		var y = field.cell.y;
		field.cell.x = x;
		for (var i = field.height + field.scroll.y.pos - 1; i >= field.scroll.y.pos; i--) {
			field.cell.y = i;
			this.cell_update(field);
		}
		field.cell.x = x;
		field.cell.y = y;
		if (inputs.get_current_field().label == field.label) {
			this.cell_update(field, 'focus');
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
		if (field.cell_type == 'custom' || typeof field.cell_display == 'function') {
			return field.cell_display(value, x, y);
		}
		// handle hex cell display
		else if (field.cell_type == 'hex') {
			return kernel.display.pad(kernel.display.hex(value), field.cell_width, '0');
		}
		// handle alphanumeric default cell display
		else {
			return kernel.display.pad(value, field.cell_width, ' ');
		}
	},

	get_cell_position: function(field, x, y) {
		// returns [x, y]
		return [
			(x == 0) ? field.origin_x : field.origin_x + (x - field.scroll.x.pos) * (field.cell_width + field.cell_margin),
			field.origin_y + y - field.scroll.y.pos
		];
	},

	init: function(field) {
		field.cell = {x:0, y:0};
		field.origin_x = field.x;
		field.origin_y = field.y;
		field.data = [];
		field.cell_advance_behavior = 'down';
		field.row_highlighted = 0;
		// check for scrolling params
		if (typeof field.scroll === 'undefined') field.scroll = {
			x: { length: field.width - 1, pos: 0 },
			y: { length: field.height - 1, pos: 0 }
		};
		field.scroll.x.max = field.scroll.x.length - field.width + 1;
		field.scroll.y.max = field.scroll.y.length - field.height + 1;
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
		field.hexkeycount = 0;
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
		// HOME key
		else if (key.label == SPKEY.HOME) {
			inputs.blur(field);
			field.cell.y = field.scroll.y.pos = 0;
			this.draw_all(field);
		}
		// END key
		else if (key.label == SPKEY.END) {
			inputs.blur(field);
			field.cell.y = field.scroll.y.length;
			field.scroll.y.pos = field.scroll.y.max;
			this.draw_all(field);
		}
		// PAGE DOWN key
		else if (key.label == SPKEY.PAGE_DOWN) {
			inputs.blur(field);
			field.cell.y += 4;
			if (field.cell.y > field.scroll.y.length) {
				field.cell.y = field.scroll.y.length;
				field.scroll.y.pos = field.scroll.y.max;
				this.draw_all(field);
			}
			else if (field.cell.y > field.scroll.y.pos + field.height - 1) {
				console.log('old: ' + field.scroll.y.pos);
				field.scroll.y.pos = (field.cell.y > field.scroll.y.max) ? field.scroll.y.max : field.cell.y - 12;
				console.log('new: ' + field.scroll.y.pos);
				this.draw_all(field);
			}
		}
		// PAGE UP key
		else if (key.label == SPKEY.PAGE_UP) {
			inputs.blur(field);
			field.cell.y -= 4;
			if (field.cell.y < 0) field.cell.y = 0;
			if (field.cell.y < field.scroll.y.pos) {
				field.scroll.y.pos = field.cell.y;
				this.draw_all(field);
			}
		}

		// cell value adjustment
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_DOWN) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y]--;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_UP) {
			if (field.data[field.cell.x][field.cell.y] < field.value_max) {
				field.data[field.cell.x][field.cell.y]++;
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_LEFT) {
			if (field.data[field.cell.x][field.cell.y] > field.value_min) {
				field.data[field.cell.x][field.cell.y] -= 16;
				if (field.data[field.cell.x][field.cell.y] < field.value_min) {
					field.data[field.cell.x][field.cell.y] = field.value_min;
				}
			}
		}
		else if (key.label == 'CONTROL_' + SPKEY.ARROW_RIGHT) {
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

		// grid delete/backspace/etc
		// BACKSPACE key
		// move current cell and below up one
		else if (key.label == SPKEY.BACKSPACE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'up';
				field.data[field.cell.x].splice(field.cell.y - 1, 1);
				if (field.data[field.cell.x].length < field.height) {
					let value = field.value_default;
					field.data[field.cell.x].push(value);
				}
				inputs.types.grid.draw_column(field, field.cell.x);
			}
		}
		// DELETE key
		// set cell empty and advance down
		else if (key.label == SPKEY.DELETE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'down';
				let value = field.value_default;
				field.data[field.cell.x][field.cell.y] = value;
			}
		}
		// INSERT key
		// insert empty cell at cursor
		else if (key.label == SPKEY.INSERT) {
			if (typeof field.value_default != 'undefined') {
				advance = false;
				let value = field.value_default;
				field.data[field.cell.x].splice(field.cell.y, 0, value);
				inputs.types.grid.draw_column(field, field.cell.x);
			}
		}
		// SHIFT BACKSPACE key
		// move current cell row and below up one
		else if (key.label == 'SHIFT_'+SPKEY.BACKSPACE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'up';
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x].splice(field.cell.y - 1, 1);
					if (field.data[x].length < field.height) {
						field.data[x].push(value);
					}
				}
				inputs.types.grid.draw_all(field);
			}
		}
		// SHIFT DELETE key
		// set cell row empty and advance down
		else if (key.label == 'SHIFT_'+SPKEY.DELETE) {
			if (typeof field.value_default != 'undefined') {
				advance = 'down';
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x][field.cell.y] = value;
				}
				inputs.types.grid.draw_all(field);
			}
		}
		// SHIFT INSERT key
		// insert empty cell at cursor
		else if (key.label == 'SHIFT_'+SPKEY.INSERT) {
			if (typeof field.value_default != 'undefined') {
				advance = false;
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x].splice(field.cell.y, 0, value);
				}
			}
			inputs.types.grid.draw_all(field);
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
		if (this.row_is_visible(field, row)) for (var i = 0; i < field.width; i++) {
			var pos = this.get_cell_position(field, i, row);
			var display = this.get_cell_display(field, i, row);
			inputs.draw(pos[0], pos[1], display, 'blur');
		}
	},

	row_highlight: function(field, row) {
		this.row_dehighlight(field, field.row_highlighted);
		field.row_highlighted = row;
		if (this.row_is_visible(field, row)) for (var i = 0; i < field.width; i++) {
			var pos = this.get_cell_position(field, i, row);
			var display = this.get_cell_display(field, i, row);
			inputs.draw(pos[0], pos[1], display, 'highlight');
		}
		if (inputs.field_index == inputs.get_field_by_label(field.label).index) inputs.focus(field);
	},

	row_is_visible: function(field, row) {
		if (row >= field.scroll.y.pos && row <= field.scroll.y.pos + field.height) return true;
		else return false;
	},

	set_block: function(field, x1, y1, x2, y2) {
	},
}
