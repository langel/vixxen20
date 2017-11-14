
/*
 * hell yeah keyboard shortcuts like a real tracker
 */
document.body.onkeydown = function(e) {
	if (e.keyCode != 116) e.preventDefault();
	if (typeof inputs.key_state[e.keyCode] === 'undefined') inputs.key_state[e.keyCode] = 0;
	vic.plot_str(24, 28, 'KEY PRESSED ' + e.keyCode + ' ', 2);
};

document.body.onkeyup = function(e) {
	delete inputs.key_state[e.keyCode];
};

const KEY_PAGE_UP = 33;
const KEY_PAGE_DOWN = 34;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;

var inputs = {
	blur: function(field) {
		vic.plot_str(field.x, field.y, field.display, 1);
	},
	focus: function(field) {
		vic.plot_str_inv(field.x, field.y, field.display, 5);
	},
	frame: function() {
		// handle keyboard field
		var field = this.fields[this.field_index];
		for (key in this.key_state) {
			var trigger = false;
			var frame_count = this.key_state[key];
			if (frame_count == 0 || frame_count == this.key_repeat_threshold) trigger = true;
			if (frame_count > this.key_repeat_threshold) {
				frame_count -= this.key_repeat_threshold;
				if (frame_count % this.key_repeat_rate == 0) trigger = true;
			}
			if (trigger) {
				// tab and shift-tab around fields
				if (key == 9) {
					if (typeof this.key_state[16] !== 'undefined') this.previous();
					else this.next();
				}
				// anything goes for custom fields
				if (field.type === 'custom') {
					field.on_key(key);
					this.update(field);
				}
				// up and down for range fields
				if (field.type === 'range') {
					if (key == KEY_ARROW_UP) {
						field.value++;
						if (field.value > field.value_max) field.value = field.value_max;
						this.update(field);
					}
					if (key == KEY_ARROW_DOWN) {
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
	get_current_field: function() {
		return this.fields[this.field_index];
	},


	field_index: 0,
	fields: [],
	global_keys: [],
	key_repeat_threshold: 10,
	key_repeat_rate: 3,

	init: function(inputs) {
		this.global_keys = inputs.global_keys;
		this.fields = inputs.fields;
		for (var i = 0; i < this.fields.length; i++) {
			if (typeof this.fields[i].on_update === 'function') {
				this.fields[i].on_update();
				this.blur(this.fields[i]);
			}
		}
		this.update(this.fields[this.field_index]);
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

	update: function(field) {
		field.on_update();
		this.focus(field);
	},

};


