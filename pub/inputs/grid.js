inputs.types.grid = {

	cell_advance: function(field, direction) {
		let marking = (typeof field.block !== 'undefined');
		if (direction !== false) field.hexkeycount = 0;
		// set new  position
		if (direction == 'down') {
			field.cell.y++;
			if (field.cell.y - field.scroll.y.pos >= field.height) {
				field.scroll.y.pos++;
				if (field.cell.y >= field.scroll.y.length) {
					field.scroll.y.pos = 0;
					field.cell.y = 0;
				}
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
			}
			else if (field.scroll.y.pos > field.cell.y) {
				field.scroll.y.pos--;
			}
		}
		field.value = field.data[field.cell.x][field.cell.y];
		// call inputs on_update if defined
		this.on_update(field);
		// check for block marking
		if (field.block && field.block.marking) this.block_update(field);
		// redraw whole grid
		this.draw_all(field);
	},

	cell_update: function(field, style='blur') {
		// update cell value
		field.value = field.data[field.cell.x][field.cell.y];
		// update cell display
		field.display = this.get_cell_display(field, field.cell.x, field.cell.y);
		// position the cell correctly
		this.update_cursor_pos(field);
		inputs.draw_display(field, style);
	},

	draw_all: function(field) {
		var x = field.cell.x;
		var y = field.cell.y;
		var old_cursor = field.cell;
		for (let cx = field.width + field.scroll.x.pos - 1; cx >= field.scroll.x.pos; cx--) {
			field.cell.x = cx;
			for (var cy = field.height + field.scroll.y.pos - 1; cy >= field.scroll.y.pos; cy--) {
				field.cell.y = cy;
				let style = 'blur';
				let is_marked = this.block_cell_is_marked(field);
				if (is_marked) style = 'block';
				if (cy == field.highlight) {
					if (is_marked) style = 'block_high';
					else style = 'highlight';
				}
				if (cx == x && cy == y) {
					if (inputs.get_current_field().label == field.label || is_marked) {
						style = 'focus';
					}
					else style = 'pose';
				}
				this.cell_update(field, style);
			}
		}
		field.cell.x = x;
		field.cell.y = y;
		// draw cursor last
		let is_marked = this.block_cell_is_marked(field, field.cell.x, field.cell.y);
		if (inputs.get_current_field().label == field.label || is_marked) {
			style = 'focus';
		}
		else style = 'pose';
		this.cell_update(field, style);
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
				column.push(field.value_default);
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
		// disable block marking if shift depressed
		this.block_marking(field);
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
			}
		}
		// . or DELETE key
		// set cell empty and advance down
		else if (key.label == SPKEY.PERIOD || key.label == SPKEY.DELETE) {
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
			}
		}
		// SHIFT BACKSPACE key
		// move current cell row and below up one
		else if (key.label == 'SHIFT_' + SPKEY.BACKSPACE
		|| key.label == 'CONTROL_' + SPKEY.BACKSPACE) {
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
		else if (key.label == 'SHIFT_' + SPKEY.DELETE
		|| key.label == 'CONTROL_' + SPKEY.DELETE) {
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
		else if (key.label == 'SHIFT_' + SPKEY.INSERT
		|| key.label == 'CONTROL_' + SPKEY.INSERT) {
			if (typeof field.value_default != 'undefined') {
				advance = false;
				let value = field.value_default;
				for (let x = 0; x < field.width; x++) {
					field.data[x].splice(field.cell.y, 0, value);
				}
			}
			inputs.types.grid.draw_all(field);
		}

		// BLOCK FUNCTIONS
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_DOWN) {
			advance = 'down';
			this.block_set(field);
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_LEFT) {
			advance = 'left';
			this.block_set(field);
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_RIGHT) {
			advance = 'right';
			this.block_set(field);
		}
		else if (key.label == 'SHIFT_'+SPKEY.ARROW_UP) {
			advance = 'up';
			this.block_set(field);
		}
		// select column/all   CONTROL A
		else if (key.label == 'CONTROL_65') {
			this.block_method_select_all(field);
		}
		// copy                CONTROL C
		else if (key.label == 'CONTROL_67') {
			this.block_method_copy(field);
		}
		// deselect            CONTROL D
		else if (key.label == 'CONTROL_68') {
			this.block_unset(field);
		}
		// paste               CONTROL V
		else if (key.label == 'CONTROL_86') {
			this.block_method_paste(field);
		}
		// cut                 CONTROL X
		else if (key.label == 'CONTROL_88') {
			this.block_method_cut(field);
		}

		// call custom key handler
		else if (typeof field.on_key === 'function') {
			advance = field.on_key(key);
		}
		// advance / redraw cell
		this.cell_advance(field, advance);
	},

	on_update: function(field) {
		// call inputs on_update if defined
		if (typeof field.on_update == 'function') field.on_update();
	},

	row_dehighlight: function(field) {
		field.highlight = -1;
	},

	row_highlight: function(field, row) {
		field.highlight = row;
	},

	row_is_visible: function(field, row) {
		if (row >= field.scroll.y.pos && row <= field.scroll.y.pos + field.height) return true;
		else return false;
	},

	update_cursor_pos: function(field) {
		field.x = (field.cell.x == 0) ? field.origin_x : field.origin_x + (field.cell.x - field.scroll.x.pos) * (field.cell_width + field.cell_margin);
		field.y = field.origin_y + field.cell.y - field.scroll.y.pos;
	},

	block_cell_is_marked: function(field) {
		if (typeof field.block == 'undefined') return false;
		let b = field.block;
		let x = field.cell.x;
		let y = field.cell.y;
		if (x >= b.mx1 && x <= b.mx2
		&& y >= b.my1 && y <= b.my2) return true;
		return false;
	},

	block_marking: function(field) {
		if (inputs.mod.shift && field.block && field.block.marking) return true;
		if (field.block) field.block.marking = false;
		return false;
	},

	block_method_copy: function(field) {
		let clipboard = [];
		if (typeof field.block == 'undefined') {
			clipboard.push([field.value]);
		} 
		else {
			let b = field.block;
			for (let x = b.mx1; x <= b.mx2; x++) {
				let column = [];
				for (let y = b.my1; y <= b.my2; y++) {
					column.push(field.data[x][y]);
				}
				clipboard.push(column);
			}
		}
		field.clipboard = clipboard;
		baby_k.notice('Data in clipboard! :D');	
		this.block_unset(field);
	},
	
	block_method_cut: function(field) {
		let clipboard = [];
		if (typeof field.block == 'undefined') {
			clipboard.push([field.value]);
			field.data[field.cell.x][field.cell.y] = field.value_default;
		} 
		else {
			let b = field.block;
			for (let x = b.mx1; x <= b.mx2; x++) {
				let column = [];
				for (let y = b.my1; y <= b.my2; y++) {
					column.push(field.data[x][y]);
					field.data[x][y] = field.value_default;
				}
				clipboard.push(column);
			}
		}
		field.clipboard = clipboard;
		baby_k.notice('DXTX in clipboard! ;}');	
		this.block_unset(field);
	},

	block_method_paste: function(field) {
		if (typeof field.clipboard == 'undefined') {
			baby_k.notice('Nothing in clipboard! :O');	
			return false;
		}
		let x = field.cell.x;
		let y = field.cell.y;
		field.clipboard.forEach((col) => {
			field.cell.y = y;
			col.forEach((val) => {
				if (field.cell.x <= field.scroll.x.length 
				&& field.cell.y <= field.scroll.y.length) {
					field.data[field.cell.x][field.cell.y] = val;
					this.on_update(field);
				}
				field.cell.y++;
			});
			field.cell.x++;
		});
		this.cell.x = x;
		this.cell.y = y;
		this.draw_all(field);
	},

	block_method_select_all: function(field) {
		if (typeof field.block == 'undefined'
		|| typeof field.block.all == 'undefined') {
			field.block = {
				marking: false,
				all: 'column',
				x1: field.cell.x,
				y1: field.scroll.y.pos,
				x2: field.cell.x,
				y2: field.scroll.y.pos + field.height - 1,
			};
			this.block_usable_mirror(field);
		}
		else if (field.block.all == 'column') {
			field.block = {
				marking: false,
				all: 'all',
				x1: field.scroll.x.pos,
				y1: field.scroll.y.pos,
				x2: field.scroll.x.pos + field.width - 1,
				y2: field.scroll.y.pos + field.height - 1,
			};
			this.block_usable_mirror(field);
		}
		else if (field.block.all == 'all') {
			this.block_unset(field);
		}
		this.draw_all(field);
	},

	block_set: function(field) {
		if (typeof field.block == 'undefined'
		|| field.block.marking == false) {
			field.block = {
				marking: true,
				x1: field.cell.x,
				y1: field.cell.y,
				x2: field.cell.x,
				y2: field.cell.y,
			};
		}
	},

	block_update: function(field) {
		// update block data
		field.block.x2 = field.cell.x;
		field.block.y2 = field.cell.y;
		this.block_usable_mirror(field);
	},

	block_unset: function(field) {
		delete field.block;
	},

	block_usable_mirror: function(field) {
		// create usable mirror
		field.block.mx1 = Math.min(field.block.x1, field.block.x2);
		field.block.mx2 = Math.max(field.block.x1, field.block.x2);
		field.block.my1 = Math.min(field.block.y1, field.block.y2);
		field.block.my2 = Math.max(field.block.y1, field.block.y2);
	},

	set_position: function(field, x, y) {
		field.cell.x = x;
		field.cell.y = y;
		field.value = field.data[x][y];
	}
}
