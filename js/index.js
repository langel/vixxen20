// MAKE IT SING

//	alert("hello ass");



vic.set_volume(3);
video.plot_str(0, 12, ` VOL 3 `, 1);

var ii = 128;
var r;
var pitched = function() {
	ii++;
	r = vic.set_voice('bass', ii);
	video.plot_str(0, 3, ` BASS ${ii} ${r} `, 1);
	r = vic.set_voice('alto', ii);
	video.plot_str(0, 5, ` ALTO ${ii} ${r} `, 1);
	r = vic.set_voice('sopr', ii);
	video.plot_str(0, 7, ` SOPR ${ii} ${r} `, 1);
	r = vic.set_voice('nois', ii);
	video.plot_str(0, 9, ` NOIS ${ii} ${r} `, 1);
};

var frame_count = 0;
var frame = function() {
	window.setTimeout(frame, vic.framerate[vic.video_standard]);
	frame_count++;
	if (ii < 256 && (frame_count % 8 == 0)) pitched();
	if (ii == 256) {
		vic.set_volume(0);
		video.plot_str(0, 12, ` VOL 0 `, 1);
	}
	if (frame_count % 2 == 0) fill_screen();
	video.plot_str(0, 0, ' V I X X E N 2 0 ', 6);
	video.plot_str(0, 15, ` FRAME ${frame_count} `, 2);
}


window.onload = function() {
	frame();
};
