// MAKE IT SING



var beta_k = {

	init: function() {
		beta_k.frame();
	},

	frame_counter: 0,

	frame: function() {
		window.setTimeout(beta_k.frame, vic.get_frame_ms());
		vic.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (pause) {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			vic.plot_str(0, 14, ' P A U S E D ', 1);
			return;
		}
		if (beta_k.frame_counter % 5 == 0) {
			vic.set_voice_value(0, pattern_data.bass[beta_k.pattern_index]);
			vic.set_voice_value(1, pattern_data.alto[beta_k.pattern_index]);
			vic.set_voice_value(2, pattern_data.sopr[beta_k.pattern_index]);
			vic.set_voice_value(3, pattern_data.nois[beta_k.pattern_index]);
			beta_k.pattern_index++;
			if (beta_k.pattern_index == pattern_data.length) beta_k.pattern_index = 0;
		}
		vic.plot_str(0, 5, ' ALTO ' + ('  ' + vic.voices[0].value).slice(-3) + ' ', 1);
		vic.plot_str(0, 6, ' TENO ' + ('  ' + vic.voices[1].value).slice(-3) + ' ', 1);
		vic.plot_str(0, 7, ' SOPR ' + ('  ' + vic.voices[2].value).slice(-3) + ' ', 1);
		vic.plot_str(0, 8, ' NUZZ ' + ('  ' + vic.voices[3].value).slice(-3) + ' ', 1);
		vic.plot_str(0, 10, ` FRAME ${beta_k.frame_counter} `, 2);
		vic.plot_str(0, 14, ' PLAYING    ', 1);
		beta_k.frame_counter++;
	},

	pattern_index: 0

}


pattern_data = {
	length: 16,
	bass: [
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
	alto: [
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
	sopr: [
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
	nois: [
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

