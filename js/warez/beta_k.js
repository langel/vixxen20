// MAKE IT SING



var beta_k = {

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,
	pattern_index: 0,

	inputs: [{
		label: 'SPEED  ',
		on_update: function(value) {
			beta_k.frame_rate = value;
		},
		type: 'byte',
		value: 5,
		value_min: 1,
		value_max: 255,
		x: 30,
		y: 3
	},{
		label: 'VOLUME ',
		on_update: function(value) {
			vic.set_volume(value);
		},
		type: 'byte',
		value: 0,
		value_min: 0,
		value_max: 15,
		x: 30,
		y: 4
	}],
	/*
	 * methods
	 */

	init: function() {
    vic.set_volume(10);
		vixxen.inputs.init(beta_k.inputs);
    beta_k.pattern.draw(pattern_data);
		beta_k.frame();
	},

  pattern: {
    draw: function(pattern) {
      for (var i = 0; i < 16; i++) {
        vic.plot_str(2, 6 + i, vixxen.display.pad(pattern.v0[i], 3, ' '), 1);
        vic.plot_str(7, 6 + i, vixxen.display.pad(pattern.v1[i], 3, ' '), 1);
        vic.plot_str(12, 6 + i, vixxen.display.pad(pattern.v2[i], 3, ' '), 1);
        vic.plot_str(17, 6 + i, vixxen.display.pad(pattern.v3[i], 3, ' '), 1);
      }
    },
    row_dehighlight: function(row_id) {
      var text = vixxen.screen.get_str(2, 6 + row_id, 20);
      vic.plot_str(2, 6 + row_id, text, 1);
    },
    row_highlight: function(row_id) {
      var text = vixxen.screen.get_str(2, 6 + row_id, 20);
      vic.plot_str(2, 6 + row_id, text, 2);
    },
  },

	frame: function() {
		window.setTimeout(beta_k.frame, vic.get_frame_ms());
		vixxen.inputs.frame();
		vic.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (pause) {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			vic.plot_str(30, 14, ' P A U S E D ', 1);
			return;
		}
		if (beta_k.frame_counter % beta_k.frame_rate == 0) {
      beta_k.pattern.row_dehighlight(beta_k.pattern_index);
			vic.set_voice_value(0, pattern_data.v0[beta_k.pattern_index]);
			vic.set_voice_value(1, pattern_data.v1[beta_k.pattern_index]);
			vic.set_voice_value(2, pattern_data.v2[beta_k.pattern_index]);
			vic.set_voice_value(3, pattern_data.v3[beta_k.pattern_index]);
			beta_k.pattern_index++;
      beta_k.pattern.row_highlight(beta_k.pattern_index);
			if (beta_k.pattern_index == pattern_data.length) beta_k.pattern_index = 0;
		}
		vic.plot_str(30, 8, ' ALTO ' + vixxen.display.hex(vic.voices[0].value), 1);
		vic.plot_str(30, 9, ' TENO ' + vixxen.display.hex(vic.voices[1].value), 1);
		vic.plot_str(30, 10, ' SOPR ' + vixxen.display.hex(vic.voices[2].value), 1);
		vic.plot_str(30, 11, ' NUZZ ' + vixxen.display.hex(vic.voices[3].value), 1);
		vic.plot_str(30, 14, ' PLAYING    ', 1);
		beta_k.frame_counter++;
		vic.plot_str(0, 28, ` FRAME ${beta_k.frame_counter} `, 2);
	}

}


pattern_data = {
	length: 16,
	v0: [
		200,
		200,
		200,
		200,
		129,
		129,
		129,
		129,
		129,
		129,
		129,
		128,
		0,
		0,
		0,
		0
	],
	v1: [
		0,
		0,
		0,
		0,
		200,
		0,
		200,
		0,
		200,
		0,
		0,
		0,
		200,
		0,
		200,
		0
	],
	v2: [
		128,
		0,
		255,
		0,
		200,
		0,
		255,
		0,
		200,
		0,
		255,
		0,
		255,
		0,
		0,
		255
	],
	v3: [
		140,
		129,
		0,
		0,
		255,
		0,
		254,
		0,
		200,
		220,
		0,
		0,
		255,
		0,
		254,
		0
	]
};

