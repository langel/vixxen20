inputs.types.string = {

	cell_load_value: function(field) {
		field.value = field.string.substr(field.pos, 1);
	},

	cell_next: function(field) {
		if (field.pos < field.length - 1) {
			inputs.blur(field);
			field.pos++;
			this.cell_load_value(field);
			this.cell_update(field);
		}
	},
	cell_previous: function(field) {
		if (field.pos > 0) {
			inputs.blur(field);
			field.pos--;
			this.cell_load_value(field);
			this.cell_update(field);
		}
	},

	cell_update: function(field) {
		field.string = field.string.substr(0, field.pos) + field.value + field.string.substr(field.pos + 1);
		field.x = field.pos + field.origin_x;
		inputs.focus(field);
	},

	init: function(field) {
		field.origin_x = field.x;
		field.string = field.value.padEnd(field.length, ' ');
		field.pos = field.value.length - 1;
		inputs.blur(field);
		this.cell_load_value(field);
		this.cell_update(field);
		inputs.blur(field);
	},

	on_key: function(field, key) {
		if (key.code == SPKEY.ARROW_RIGHT) {
			this.cell_next(field);
		}
		else if (key.code == SPKEY.ARROW_LEFT) {
			this.cell_previous(field);
		}
		else if (key.code == SPKEY.ARROW_UP) {
			if (typeof inputs.fields[field.index-1] !== 'undefined' &&
				inputs.fields[field.index-1].type == 'string') inputs.previous();
		}
		else if (key.code == SPKEY.ARROW_DOWN) {
			if (typeof inputs.fields[field.index+1] !== 'undefined' &&
				inputs.fields[field.index+1].type == 'string') inputs.next();
		}
		else if (key.code == SPKEY.BACKSPACE) {
			field.value = ' ';
			this.cell_update(field);
			this.cell_previous(field);
		}
		else if (inputs.is_special_key(key)) {}
		else {
			field.value = key.input.substr(0, 1);
			console.log(field.value);
			this.cell_update(field);
			this.cell_next(field);
			inputs.update(field);
			console.log(field.string);
		}
	}
}
