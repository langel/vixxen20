
/*
 * hell yeah keyboard shortcuts like a real tracker
 */

window.addEventListener('blur', function() {
	console.log('blur');
	inputs.mod.shift = false;
	inputs.mod.control = false;
	inputs.key_state = [];
});

document.body.onkeydown = function(e) {
	e.preventDefault();
	audio.resume();
	inputs.key_last = e.keyCode;
	if (typeof inputs.key_state[e.keyCode] === 'undefined') {
		if (e.keyCode == SPKEY.SHIFT) {
			inputs.mod.shift = true;
		} else if (e.keyCode == SPKEY.CONTROL || e.keyCode == SPKEY.META) {
			inputs.mod.control = true;
		} else {
			let input = "";
			let code = 0;

			let keyCodeLookUp = {
				"Semicolon":    { key: ";",  keyCode: 186, shiftKey: ":"},
				"Equal":        { key: "=",  keyCode: 187, shiftKey: "+"},
				"Comma":        { key: ",",  keyCode: 188, shiftKey: "<"},
				"Minus":        { key: "-",  keyCode: 189, shiftKey: "_"},
				"Period":       { key: ".",  keyCode: 190, shiftKey: ">"},
				"Slash":        { key: "/",  keyCode: 191, shiftKey: "?"},
				"Backquote":    { key: "`",  keyCode: 192, shiftKey: "~"},
				"BracketLeft":  { key: "[",  keyCode: 219, shiftKey: "{"},
				"Backslash":    { key: "\\", keyCode: 220, shiftKey: "|"},
				"BracketRight": { key: "]",  keyCode: 221, shiftKey: "}"},
				"Quote":        { key: "'",  keyCode: 222, shiftKey: "\""}
			};

			if (e.code.includes("Key")) {
				// we can get the input key and code by using the last character of e.code
				let char = e.code.charAt(e.code.length - 1);

				if (inputs.mod.shift) {
					input = char;
				} else {
					input = char.toLowerCase();
				}
				code = e.code.charCodeAt(e.code.length - 1);
			} else if (keyCodeLookUp[e.code]) {
				// use the lookup object for characters which are changed on different
				// keyboard layouts but aren't letters or digits
				if (inputs.mod.shift) {
					input = keyCodeLookUp[e.code].shiftKey;
				} else {
					input = keyCodeLookUp[e.code].key;
				}
				code = keyCodeLookUp[e.code].keyCode;
			} else {
				// usually if key is universal, e.g. arrow keys
				input = e.key;
				code = e.keyCode;
			}

			inputs.key_state[e.keyCode] = {
				frames: 0,
				input: input,
				code: code,
				inputKey: e.key // store the "real" key pressed, used for string inputs
			};
		}
	}
};

document.body.onkeyup = function(e) {
	if (e.keyCode == SPKEY.SHIFT) inputs.mod.shift = false;
	else if (e.keyCode == SPKEY.CONTROL || e.keyCode == SPKEY.META) inputs.mod.control = false;
	else delete inputs.key_state[e.keyCode];
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
	META: 18,
	NUMLOCK: 144,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	SCROLLLOCK: 145,
	SHIFT: 16,
	TAB: 9,
};

const KEYS = {
	APOSTROPHE: 222,
	BACKSLASH: 220,
	COMMA: 188,
	DASH: 189,
	EQUAL: 187,
	NUM_ASTERISK: 106,
	NUM_MINUS: 109,
	NUM_PLUS: 107,
	NUM_SLASH: 111,
	PERIOD: 190,
	SPACE: 32,
};

const HEXKEY = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 81, 87, 69, 82, 84, 89];

var inputs = {
	
	style: {
		// color, inverse
		block: [7, 1],
		block_high: [2, 1],
		blur: [1, 0],
		focus: [5, 1],
		highlight: [2, 0],
		pose: [5, 0],
	},

	field_index: 0,
	fields: [],
	key_last: '',
	key_repeat_threshold: 12,
	key_repeat_rate: 3,
	key_state: {},
	types: {},

	mod: {
		shift: false,
		control: false,
	},

	draw: function(x, y, display, style) {
		if (this.style[style][1] == 0) kernel.plot_str(x, y, display, this.style[style][0]);
		else kernel.plot_str_inv(x, y, display, this.style[style][0]);
	},
	
	draw_display: function(field, style) {
		this.draw(field.x, field.y, this.get_field_display(field), style);
	},

	blur: function(field) {
		this.draw_display(field, 'blur');
	},

	focus: function(field) {
		this.draw_display(field, 'focus');
	},

	block: function(field) {
		this.draw_display(field, 'block');
	},

	highlight: function(field) {
		this.draw_display(field, 'highlight');
	},

	frame: function() {
		// handle keyboard field
		var field = this.fields[this.field_index];

		for (let index in this.key_state) {

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
				var field_type = inputs.types[field.type];
				var value = field.value;
				if (typeof field_type.on_key !== 'undefined') {
					field_type.on_key(field, this.key_state[index]);
				}
				if (typeof field_type.on_update !== 'undefined') {
					field_type.on_update(field);
				}
				else if (value != field.value) this.update(field);
			}
		}
		// check type for frame handler
		this.fields.forEach((field) => {
			let type = inputs.types[field.type];
			if (typeof type.frame === 'function') {
				type.frame(field);
			}
		});
	},

	get_current_field: function() {
		return this.fields[this.field_index];
	},

	get_current_field_type: function() {
		return this.get_current_field().type;
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
		this.update_all();
		kernel.frame.hook_add({
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
		if (typeof field.on_update !== 'undefined') field.on_update();
		this.focus(field);
	},

	update_all: function() {
		for (var i = 0; i < this.fields.length; i++) {
			this.fields[i].index = i;
			if (this.fields[i].hasOwnProperty('origin_x')) {
				this.fields[i].x = this.fields[i].origin_x;
			}
			if (this.fields[i].hasOwnProperty('origin_y')) {
				this.fields[i].y = this.fields[i].origin_y;
			}
			// run input type init
			if (typeof this.types[this.fields[i].type].init === 'function') {
				this.types[this.fields[i].type].init(this.fields[i]);
			}
			else {
				this.draw_display(this.fields[i], 'blur');
			}
			// run field on_update
			if (typeof this.fields[i].on_update === 'function') {
				this.fields[i].on_update();
			}
		}
		this.update(this.fields[this.field_index]);
	}

};


