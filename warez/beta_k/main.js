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
		'inputs',
		'pattern_grid',
		'song_schema',
	],
	
	octave: 0,
	pattern_index: 0,
	pause: true,

	inputs: {},

	/*
	 * methods
	 */

	init: function() {
		vixxen.screen.clear();
		vixxen.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		vixxen.plot_str(2, 8, 'ch1 ch2 ch3 ch4  SongonG0NGg  SPD VOL', 1);
		this.song = this.song_new();
		this.inputs = beta_k_inputs;
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
		this.song_play_pattern();
	},

	frame: function() {
		vixxen.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (beta_k.pause !== true) {
			if (beta_k.frame_counter % beta_k.frame_rate == 0) {
				beta_k_pattern_grid.play_next_row();
			}
			vixxen.plot_str(30, 3, ' ALTO ' + vixxen.display.hex(vic.voices[0].value), 1);
			vixxen.plot_str(30, 4, ' TENR ' + vixxen.display.hex(vic.voices[1].value), 1);
			vixxen.plot_str(30, 5, ' SOPR ' + vixxen.display.hex(vic.voices[2].value), 1);
			vixxen.plot_str(30, 6, ' NUZZ ' + vixxen.display.hex(vic.voices[3].value), 1);
		}
		beta_k.frame_counter++;
		vixxen.plot_str(0, 28, ` FRAME ${beta_k.frame_counter} `, 2);
	},

	play_status: function(status) {
		vixxen.plot_str(22, 1, ` ${status}   `, 1);
	},

	song_new: function() {
		return JSON.parse(JSON.stringify(beta_k_new_song));
	},

	song_pause: function() {
		beta_k.pause = true;
		vixxen.silent();	
		this.play_status('PAUSED');
		return;
	},

	song_play: function() {
		beta_k.pause = false;
		this.play_status('PLAYING');
	},

	song_play_pattern: function() {
		beta_k.pause = false;
		this.play_status('PLAYING');
	},

	song_stop: function() {
		beta_k.pause = true;
		vixxen.silent();	
		beta_k_pattern_grid.play_position = 0;
		this.play_status('STOPPED');
	},

	song: 'load a song dummy',
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

