// MAKE IT SING

/*
 * VIC20 Song Data Schema


	BETA-K MEMORY MAP

	1000-1DFF	complete program space address

	1000-10xx	BASIC SYS call to start program
	10XX-13AF	~928 bytes for player
	13B0-13BF	16 char string	'title'
	13C0-13CF	16 char string	'artist'
	13D0-13DF	16 char string	'copyright/info'
	13E0-13EF	16 row speed table
	13F0-13FF	16 row volume table
	1400-1BFF	128 16 row patterns
	1C00-1DFF	128 rows pattern order list
					4 bytes per row for all 4 channels

	pattern object - 16 bytes each
		value h80-hFF	pitch value
		value h00	do nothing
		value h01	note OFF
		value h02	jump to NXT song row
		value h03	END playback
		// XXX ...potential effects...
		// depends on space restraints of player
		value h1x	pitch slide up by x per frame
		value h2x	pitch slide down by x per frame
		value h3x	pitch slide up by x per row
		value h4x	pitch slide down by x per row
		...etc.
*/

var beta_k = {

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,

	includes: [
		'pattern_grid',
	],
	
	pattern_index: 0,
	pause: false,

	inputs: {
		fields: [{
			label: 'SPEED  ',
			type: 'range',
			on_update: function() {
				beta_k.frame_rate = this.value;
				this.display = this.label + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 5,
			value_min: 1,
			value_max: 99,
			x: 30,
			y: 3
		},{
			label: 'VOLUME ',
			type: 'range',
			on_update: function() {
				vic.set_volume(this.value);
				this.display = this.label + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 1,
			value_min: 0,
			value_max: 15,
			x: 30,
			y: 4
		}],
		
		global_keys: [{
			key: 13,
			on_update: function() {
				if (vic.video_mode == 'ntsc') vic.video_mode = 'pal';
				else vic.video_mode = 'ntsc';
			}
		},{
			key: 32,
			on_update: function() {
				beta_k.pause = !beta_k.pause;
			}
		}],
	},
	/*
	 * methods
	 */

	init: function() {
		vixxen.screen.clear();
		vic.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		this.song = JSON.parse(JSON.stringify(this.new_song));
		this.inputs.fields.unshift(beta_k_pattern_grid);
		var i;
		for (i = 0; i < 4; i++) {
			beta_k_pattern_grid.on_load(i, this.song.patterns[i]);
		};
		inputs.init(this.inputs);
		vixxen.frame.hook_add({
			object: 'beta_k',
			method: 'frame'
		});
	},

	frame: function() {
		vic.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (beta_k.pause) {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			vic.plot_str(30, 14, ' PAUSED   ', 1);
			return;
		}
		if (beta_k.frame_counter % beta_k.frame_rate == 0) {
			beta_k_pattern_grid.play_next_row();
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
	},

	song: 'load a song dummy',
	new_pattern: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	new_song: {
		title: 'TITLE',
		artist: 'ARTIST',
		pattern_length: 16,
		patterns: [
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
			[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		],
		list: [[0,1,2,3]],
	},
	play_position: {
		list: 0,
		row: 0,
		increase: function() {
			this.row++;
			if (this.row >= 16) {
				this.row = 0;
				this.list++;
				if (this.list >= beta_k.song.list.length) this.list = 0;
			}
		},
	},

}


patterns = {
	length: 16,
	data:	[[
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
	],	[
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
	],	[
		128,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		155,
		0,
		0,
		155
	],	[
		140,
		129,
		0,
		0,
		155,
		0,
		254,
		0,
		200,
		220,
		0,
		0,
		155,
		0,
		254,
		0
	]]
};

