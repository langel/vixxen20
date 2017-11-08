
/*
 * hell yeah keyboard shortcuts like a real tracker
 */
document.body.onkeydown = function(e) {
	e.preventDefault();
	if (typeof inputs.key_state[e.keyCode] === 'undefined') inputs.key_state[e.keyCode] = 0;
	vic.plot_str(24, 28, 'KEY PRESSED ' + e.keyCode + ' ', 2);
};

document.body.onkeyup = function(e) {
	delete inputs.key_state[e.keyCode];
};


var inputs = {
	blur: function(input) {
		vic.plot_str(input.x, input.y, input.label + this.value_pad(input), 1);
	},
	focus: function(input) {
		vic.plot_str_inv(input.x, input.y, input.label + this.value_pad(input), 5);
	},
	frame: function() {
		// handle keyboard field
		var field = this.fields[this.field_index];
		for (key in this.key_state) {
			if (this.key_state[key] != 0) {
				if (this.key_state[key] == this.frame_key_repeat) this.key_state[key] = 0;
			}
			else {
				// tab and shift-tab around fields
				if (key == 9) {
					if (typeof this.key_state[16] !== 'undefined') this.previous();
					else this.next();
				}
				// up and down for ranges
				if (field.type === 'range') {
					if (key == 38) {
						field.value++;
						if (field.value > field.value_max) field.value = field.value_max;
						this.update(field);
					}
					if (key == 40) {
						field.value--;
						if (field.value < field.value_min) field.value = field.value_min;
						this.update(field);
					}
				}
				// handle defined global keys
				for (global_key in this.global_keys) {
					if (this.global_keys[global_key].key == key) {
						this.global_keys[global_key].on_update();
					}
				}
			}
			this.key_state[key]++;
			if (this.key_state[key] >= this.frame_key_repeat) {
				this.key_state[key] = 0;
			}
		}
	},

	frame_key_repeat: 10,

	field_index: 0,
	fields: [],
	global_keys: [],

	init: function(inputs) {
		this.global_keys = inputs.global_keys;
		this.fields = inputs.fields;
		for (var i = 0; i < this.fields.length; i++) {
			this.fields[i].on_update();
			this.blur(this.fields[i]);
		}
		this.focus(this.fields[this.field_index]);
		vixxen.frame.hook_add({
			object: 'inputs',
			method: 'frame'
		});
	},

	key_state: {},

	next: function() {
		this.blur(this.fields[this.field_index]);
		this.field_index++;
		if (this.field_index >= this.fields.length) {
			this.field_index = 0;
		}
		this.focus(this.fields[this.field_index]);
	},

	previous: function() {
		this.blur(this.fields[this.field_index]);
		this.field_index--;
		if (this.field_index < 0) {
			this.field_index = this.fields.length - 1;
		}
		this.focus(this.fields[this.field_index]);
	},

	update: function(input) {
		vic.plot_str_inv(input.x, input.y, input.label + this.value_pad(input), 5);
		if (typeof input.on_update === 'function') input.on_update();
	},

	value_pad: function(input) {
		return input.value.toString().padStart(input.value_max.toString().length, ' ');
	},
};


