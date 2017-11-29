inputs.types.grid = {

	cell_down: function(field) {
	},

	cell_left: function(field) {
	},

	cell_right: function(field) {
	},

	cell_up: function(field) {
	},

	cell_update: function(field) {
	},

	draw_all: function(field) {
		for (var x = field.width; x > 0; x--) {
			this.draw_column(field, x);
		}
	},

	draw_cell: function(field) {
		field.display = field.data[field.x][field.y];
		inputs.blur(field);
		field.x = x;
		field.y = y;
	},

	draw_column: function(field, x) {
		field.x = x;
		for (var y = field.height; y > 0; y--) {
			field.y = y;
			field.display = field.data[x][y];
			this.draw_cell();
		}
	},

	draw_row: function(field, y) {
		field.y = y;
		for (var x = field.width; x > 0; x--) {
			field.x = x;
			field.display = field.data[x][y];
			this.draw_cell();
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
		for (var x = field.width; x > 0; x--) {
			var column = [];
			for (var y = field.heigth; y > 0; y--) {
				column.push(field.cell_value_default);
			}
			field.data.push[column];
		}
		field.cell = {
			x: 0,
			y: 0,
			display: field.data[field.cell.x][field.cell.y],
		};

		this.draw_all(field);
	},

	on_key: function(field, key) {
	},

	row_dehighlight: function(field, row) {
	},

	row_highlight: function(field, row) {
	},

	set_block: function(field, x1, y1, x2, y2) {
	},
}
