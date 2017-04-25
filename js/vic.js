

// INITIALIZE VIC CHIP INTERFACE

var stdout = document.getElementById('dummy');

var audio = new (window.AudioContext || window.webkitAudioContext)();

var vic = {};

vic.set_volume = function(value) {
	// 4 bit value max
	var vol = 0;
	if (value > 15) vol = 15;
	if (value <= 0) vol = 0;
	else vol = value / 15; 
	vic.vol.gain.value = vol;
	document.getElementById('vol').innerHTML = `${value} ${vol}`;
}

vic.set_voice = function(voice, value)	{
	if (!(value && 128)) vic[voice].stop();
	else {
		var p;
		var i = value - 128;
		if (i == 127) p = (vic[voice].clock[vic.video_standard] / -1);
		else p = vic[voice].clock[vic.video_standard] / (127 - i);
		vic[voice].frequency.value = p;
		// show in debugger
		var out = `${i} ${p}`;
		document.getElementById(voice).innerHTML = out;
	}
}

// in milliseconds
vic.framerate = {
	ntsc: (1000/60),
	pal: (1000/50)
}

// default video standard
vic.video_standard = 'ntsc';

vic.vol = audio.createGain();
vic.vol.gain.value = 0.5;
vic.vol.connect(audio.destination);

vic.bass = audio.createOscillator();
vic.bass.type = 'square';
vic.bass.frequency.value = 0;
vic.bass.ram_address = 36874;
vic.bass.clock = {
	ntsc: 3995,
	pal: 4329
};
vic.bass.start();
vic.bass.connect(vic.vol);

vic.alto = audio.createOscillator();
vic.alto.type = 'square';
vic.alto.frequency.value = 0;
vic.alto.ram_address = 36875;
vic.alto.clock = {
	ntsc: 7990,
	pal: 8659
};
vic.alto.start();
vic.alto.connect(vic.vol);

vic.sopr = audio.createOscillator();
vic.sopr.type = 'square';
vic.sopr.frequency.value = 0;
vic.sopr.ram_address = 36876;
vic.sopr.clock = {
	ntsc: 15980,
	pal: 17320
};
vic.sopr.start();
vic.sopr.connect(vic.vol);

// nois coming soon! :)
vic.nois_buffer_size = 512;
vic.nois = audio.createScriptProcessor(vic.nois_buffer_size, 1, 1);
vic.nois.frequency = {value:0};
vic.nois.delta = {
	pos: 0,
	counter: 0
};
vic.nois.ram_address = 36877;
vic.nois.clock = {
	ntsc: 31960,
	pal: 34640
};
vic.nois.onaudioprocess = function(e) {
	var output_buffer = e.outputBuffer;
	var output_data = output_buffer.getChannelData(0);
	for (var i=0; i < vic.nois_buffer_size; i++) {
		if (vic.nois.delta.counter == 0) {
			vic.nois.delta.pos=(Math.random()*4)-2;
			vic.nois.delta.counter = Math.floor(audio.sampleRate / vic.nois.frequency.value);
		}
		output_data[i] = vic.nois.delta.pos;
		vic.nois.delta.counter--;
	}
}
vic.nois.connect(vic.vol);




