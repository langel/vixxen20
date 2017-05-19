// MAKE IT SING

/*
 * VIC20 Song Data Schema

  16 bytes : "title"
  16 bytes : "artist"
  16 bytes : "copy"
  1 byte : base volume and video standard
    bit 7 set is NTSC (unset PAL)
    bits 3-0 volume
  1 byte : base speed
  6 song order objects for the 4 voices, speed, and volume
  n bytes channel pattern objects and tables

  track pattern order object
    1 byte : order length - max of 127
      bit 7 : sets track loop to true
      bits 6-0 : order length 
      value x00 means the track is inactive
    n bytes : pattern numbers in order

  pattern object
    1 byte : pattern length
    n bytes - pattern column data
      value x00 is note off
      values x01-x7f length of repeat
      values x80-xff note value

  volume table object
    1 byte - length of table (row count >> 1)
    n bytes - dual volume values
      values are max 4 bits in size (x00-x0f)
      bits 7-4 even row volume value
      bits 3-0 odd row volume value

  On init the player needs to scan the song data and save pointers in the 
  zero (and maybe 1st) page for order lists and pattern start addresses.

  3583 bytes free ~= 14 pages (in the 4 bit number range)
  ...set aside about 1k for the play routine...
  2.5k = 10 pages (still in the 4 bit number range)

  Given that pattern addresses require hi and lo bytes the player may
  require two bytes per pattern. If using a single page for these pointers
  then the max number of patterns would be 128. Handling patterns and
  volume tables might be interesting...
*/

var beta_k = {

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,
	
	note_values : [
		131,140,145,151,158,161,166,173,178,181,185,189,
		192,197,200,203,206,208,211,214,216,218,220,222,
		224,226,227,229,231,232,233,234,236,237,238,239,
		240,241
	],
	note_names : ['C ','C#','D ','D#','E ','F ','F#','G ','G#','A ','A#','B '],
	note_keycodes : [
		// bottom row
		90,83,88,68,67,86,71,66,72,78,74,77,
		// top row
		81,50,87,51,69,82,53,84,54,89,55,85,73,57,79.48,80
	],

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
		vic.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
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
			vic.plot_str(30, 14, ' PAUSED   ', 1);
			return;
		}
		if (beta_k.frame_counter % beta_k.frame_rate == 0) {
			beta_k.pattern.row_dehighlight(beta_k.pattern_index);
			vic.set_voice_value(0, pattern_data.v0[beta_k.pattern_index]);
			vic.set_voice_value(1, pattern_data.v1[beta_k.pattern_index]);
			vic.set_voice_value(2, pattern_data.v2[beta_k.pattern_index]);
			vic.set_voice_value(3, pattern_data.v3[beta_k.pattern_index]);
			beta_k.pattern_index++;
			if (beta_k.pattern_index == pattern_data.length) beta_k.pattern_index = 0;
      	beta_k.pattern.row_highlight(beta_k.pattern_index);
		}
		var display = (vic.voices[0].value & 128) ? vixxen.display.hex(vic.voices[0].value) : '  ';
		vic.plot_str(30, 8, ' ALTO ' + display, 1);
		var display = (vic.voices[1].value & 128) ? vixxen.display.hex(vic.voices[1].value) : '  ';
		vic.plot_str(30, 9, ' TENO ' + display, 1);
		var display = (vic.voices[2].value & 128) ? vixxen.display.hex(vic.voices[2].value) : '  ';
		vic.plot_str(30, 10, ' SOPR ' + display, 1);
		var display = (vic.voices[3].value & 128) ? vixxen.display.hex(vic.voices[3].value) : '  ';
		vic.plot_str(30, 11, ' NUZZ ' + display, 1);
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

