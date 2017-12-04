
/*
 * hell yeah keyboard shortcuts like a real tracker
 */
document.body.onkeydown = function(e) {
	e.preventDefault();
	if (typeof inputs.key_state[e.keyCode] === 'undefined') {
		if (e.keyCode == SPKEY.SHIFT) inputs.mod.shift = true;
		else if (e.keyCode == SPKEY.COMMAND || e.keyCode == SPKEY.CONTROL) inputs.mod.control = true;
		else inputs.key_state[e.keyCode] = {
			frames: 0,
			input: e.key,
			code: e.keyCode,
		};
	}
	vixxen.plot_str(24, 28, 'KEY PRESSED ' + e.keyCode + ' ', 2);
	console.log(e);
};

document.body.onkeyup = function(e) {
	if (e.keyCode == SPKEY.SHIFT) inputs.mod.shift = false;
	else if (e.keyCode == SPKEY.COMMAND || e.keyCode == SPKEY.CONTROL) inputs.mod.control = false;
	else delete inputs.key_state[e.keyCode];
	console.log('key up: ' + e.key);
};

const SPKEY = {
	ALT: 18,
	ARROW_DOWN: 40,
	ARROW_LEFT: 37,
	ARROW_RIGHT: 39,
	ARROW_UP: 38,
	CAPSLOCK: 20,
	COMMAND: 91,
	CONTROL: 17,
	BACKSPACE: 8,
	DELETE: 46,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	INSERT: 45,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	SHIFT: 16,
	TAB: 9,
};

var inputs = {
	
	style: {
		// XXX not implemented yet :(
		// color, inverse
		blur: [1, 0],
		block: [3, 1],
		focus: [5, 1],
		highlight: [2, 0],
	},

	field_index: 0,
	fields: [],
	key_repeat_threshold: 10,
	key_repeat_rate: 3,
	key_state: {},
	types: {},

	mod: {
		shift: false,
		control: false,
	},

	blur: function(field) {
		var display = inputs.get_field_display(field);
		vixxen.plot_str(field.x, field.y, display, 1);
	},
	focus: function(field) {
		var display = inputs.get_field_display(field);
		vixxen.plot_str_inv(field.x, field.y, display, 5);
	},

	frame: function() {
		// handle keyboard field
		var field = this.fields[this.field_index];
		for (index in this.key_state) {

			// key repeat handling
			var key = this.key_state[index].code;
			var trigger = false;
			var frame_count = this.key_state[index].frames;
			if (frame_count == 0 || frame_count == this.key_repeat_threshold) trigger = true;
			if (frame_count > this.key_repeat_threshold) {
				frame_count -= this.key_repeat_threshold;
				if (frame_count % this.key_repeat_rate == 0) trigger = true;
			}
			this.key_state[index].frames++;
			if (this.key_state[index].frames >= this.frame_key_repeat) {
				this.key_state[index].frames = 0;
			}

			if (trigger) {
				// modify key token
				if (inputs.mod.shift) key = 'SHIFT_' + key;
				if (inputs.mod.control) key = 'CONTROL_' + key;
				this.key_state[index].label = key;

				// GLOBAL KEY HANDLING
				for (global_key in this.global_keys) {
					if (this.global_keys[global_key].key == key) {
						this.global_keys[global_key].on_update();
					}
				}

				// FIELD HANDLING
				if (typeof inputs.types[field.type] !== 'undefined') {
					var value = field.value;
					inputs.types[field.type].on_key(field, this.key_state[index]);
					if (value != field.value) this.update(field);
				}
			}
		}
	},

	get_current_field: function() {
		return this.fields[this.field_index];
	},

	get_field_by_label: function(label) {
		var output = false;
		this.fields.forEach(function(field) {
			if (field.label == label) output = field;
		});
		if (!output) console.log(`FAILed to find input field "${label}"`);
		else return output;
	},

	get_field_display: function(field) {
		return (typeof field.display === 'undefined') ? field.value : field.display;
	},


	init: function(inputs) {
		this.global_keys = this.global_keys.concat(inputs.global_keys);
		this.fields = inputs.fields;
		for (var i = 0; i < this.fields.length; i++) {
			this.fields[i].index = i;
			// run input type init
			console.log(this.types[this.fields[i].type]);
			if (typeof this.types[this.fields[i].type].init === 'function') {
				this.types[this.fields[i].type].init(this.fields[i]);
			}
			// run field on_update
			if (typeof this.fields[i].on_update === 'function') {
				this.fields[i].on_update();
			}
			this.blur(this.fields[i]);
		}
		this.update(this.fields[this.field_index]);
		vixxen.frame.hook_add({
			object: 'inputs',
			method: 'frame'
		});
	},

	is_special_key: function(key) {
		for (var k in SPKEY) if (key.code == SPKEY[k]) return true;
		return false;
	},

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

	set_value: function(field_name, value) {
		var field = this.get_field_by_label(field_name);
		field.value = value;
		if (this.field_index == field.index) this.update(field);
		else {
			field.on_update();
			this.blur(field);
		}
	},

	update: function(field) {
		field.on_update();
		this.focus(field);
	},

};


