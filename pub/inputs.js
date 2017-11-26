
/*
 * hell yeah keyboard shortcuts like a real tracker
 */
document.body.onkeydown = function(e) {
	// f5 to the future
	if (e.keyCode != 116) e.preventDefault();
	if (typeof inputs.key_state[e.keyCode] === 'undefined') {
		if (e.keyCode == KEY_SHIFT) inputs.mod.shift = true;
		else if (e.keyCode == KEY_COMMAND || e.keyCode == KEY_CONTROL) inputs.mod.control = true;
		else inputs.key_state[e.keyCode] = 0;
	}
	vic.plot_str(24, 28, 'KEY PRESSED ' + e.keyCode + ' ', 2);
};

document.body.onkeyup = function(e) {
	if (e.keyCode == KEY_SHIFT) inputs.mod.shift = false;
	else if (e.keyCode == KEY_COMMAND || e.keyCode == KEY_CONTROL) inputs.mod.control = false;
	else delete inputs.key_state[e.keyCode];
};

const KEY_SHIFT = 16;
const KEY_COMMAND = 91;
const KEY_CONTROL = 17;
const KEY_PAGE_UP = 33;
const KEY_PAGE_DOWN = 34;
const KEY_ARROW_LEFT = 37;
const KEY_ARROW_UP = 38;
const KEY_ARROW_RIGHT = 39;
const KEY_ARROW_DOWN = 40;

var inputs = {

	mod: {
		shift: false,
		control: false,
	},

	blur: function(field) {
		var display = inputs.get_field_display(field);
		vic.plot_str(field.x, field.y, display, 1);
	},
	focus: function(field) {
		var display = inputs.get_field_display(field);
		vic.plot_str_inv(field.x, field.y, display, 5);
	},
	frame: function() {
		// handle keyboard field
		var field = this.fields[this.field_index];
		for (key in this.key_state) {

			// key repeat handling
			var trigger = false;
			var frame_count = this.key_state[key];
			if (frame_count == 0 || frame_count == this.key_repeat_threshold) trigger = true;
			if (frame_count > this.key_repeat_threshold) {
				frame_count -= this.key_repeat_threshold;
				if (frame_count % this.key_repeat_rate == 0) trigger = true;
			}
			this.key_state[key]++;
			if (this.key_state[key] >= this.frame_key_repeat) {
				this.key_state[key] = 0;
			}

			if (trigger) {
				// modify key token
				if (inputs.mod.shift) key = 'SHIFT_' + key;
				if (inputs.mod.control) key = 'CONTROL_' + key;

				// GLOBAL KEY HANDLING

				for (global_key in this.global_keys) {
					if (this.global_keys[global_key].key == key) {
						this.global_keys[global_key].on_update();
					}
				}

				// FIELD HANDLING

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
				// string
				if (field.type === 'string') {
				}

			}
		}
	},

	get_current_field: function() {
		return this.fields[this.field_index];
	},

	get_field_display: function(field) {
		return (typeof field.display === 'undefined') ? field.value : field.display;
	},


	field_index: 0,
	fields: [],

	global_keys: [{
		// tab
		// move to next input
		key: 9,
		on_update: function() {
			inputs.next();
		},
	},{
		// shift tab
		// widdershins to previous input
		key: 'SHIFT_9',
		on_update: function() {
			inputs.previous();
		},
	},{
		// control tab 
		// toggle video refresh rate
		key: 'CONTROL_192',
		on_update: function() {	
			if (vic.video_mode == 'ntsc') vic.video_mode = 'pal';
			else vic.video_mode = 'ntsc';
			console.log('VIDEO MODE ' + vic.video_mode);
		},
	},{
		// control capslock 
		// toggle through character sets
		key: 'CONTROL_20',
		on_update: function() {	
			var block = vic.char_rom_block;
			block++;
			if ((block+1) * vic.char_rom_block_size > char_rom.length) block = 0;
			vic.set_char_rom_block(block);
			console.log('CHAR ROM BLOCK ' + block);
		},
	},{
		// control escape
		// reboot vixxen20
		key: 'CONTROL_SHIFT_220',
		on_update: function() {
			location.reload();
		},
	}],

	key_repeat_threshold: 10,
	key_repeat_rate: 3,

	init: function(inputs) {
		this.global_keys = this.global_keys.concat(inputs.global_keys);
		this.fields = inputs.fields;
		for (var i = 0; i < this.fields.length; i++) {
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


