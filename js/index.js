// MAKE IT SING

//	alert("hello ass");

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



var pattern_index = 0;
var frame_counter = 0;
frame = function() {
	window.setTimeout(frame, vic.framerate[vic.framemode]);
	// fill_screen();
	if (frame_counter % 5 == 0) {
		vic.set_voice_value(0, pattern_data.bass[pattern_index]);
		vic.set_voice_value(1, pattern_data.alto[pattern_index]);
		vic.set_voice_value(2, pattern_data.sopr[pattern_index]);
		vic.set_voice_value(3, pattern_data.nois[pattern_index]);
		pattern_index++;
		if (pattern_index == pattern_data.length) pattern_index = 0;
	}
	video.plot_str(0, 5, ' BASS ' + ('  ' + vic.voices[0].value).slice(-3) + ' ', 1);
	video.plot_str(0, 6, ' ALTO ' + ('  ' + vic.voices[1].value).slice(-3) + ' ', 1);
	video.plot_str(0, 7, ' SOPR ' + ('  ' + vic.voices[2].value).slice(-3) + ' ', 1);
	video.plot_str(0, 8, ' NUZZ ' + ('  ' + vic.voices[3].value).slice(-3) + ' ', 1);
	video.plot_str(0, 10, ` FRAME ${frame_counter} `, 2);
	frame_counter++;
};

window.onload = function() {
	vic.init();
	video.plot_str(0, 0, ' V I X X E N   2 0 ', 6);
	vic.set_volume(10);
	video.plot_str(0, 12, ` VOL 10 `, 1);
	frame();
};

var fill_color = 0;


fill_screen = function() {
	var max_x = Math.floor(x_max / video.pixel_mul);
	var max_y = Math.floor(y_max / video.pixel_mul);
	for (y=0; y<max_y; y++) {
		for (x=0; x<max_x; x++) {
			video.plot_pixel(x, y, fill_color % 15) 
			fill_color++;
		}
	}
}

fill_screen();

character_rom_test = function() {
	var char_count = 0;
	for (y=0; y<16; y++) {
		for (x=0; x<16; x++) {
			video.plot_char(x, y, char_count, 1);
			char_count++;
		}
	}
}

