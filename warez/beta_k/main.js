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


var new_pattern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

var new_song = {
	title: 'Title 6789abcdef',
	artist: 'Artist',
	copy_info: 'Copy Info',
	pattern_length: 16,
	patterns: [
		new_pattern,
		new_pattern,
		new_pattern,
		new_pattern,
	],
	list: [[0,1,2,3]],
};


var beta_k = {

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,

	includes: [
		'pattern_grid',
	],
	
	octave: 0,
	pattern_index: 0,
	pause: true,

	inputs: {
		fields: [{
			label: 'SPEED',
			type: 'range',
			on_update: function() {
				beta_k.frame_rate = this.value;
				this.display = this.label + '  ' + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 5,
			value_min: 1,
			value_max: 99,
			x: 20,
			y: 3
		},{
			label: 'VOLUME',
			type: 'range',
			on_update: function() {
				vic.set_volume(this.value);
				this.display = this.label + ' ' + vixxen.display.pad(this.value, 2, ' ');
			},
			value: 1,
			value_min: 0,
			value_max: 15,
			x: 20,
			y: 4
		},{
			label: 'OCTAVE',
			type: 'range',
			on_update: function() {
				beta_k.octave = this.value;
				this.display = this.label + '  ' + this.value;
			},
			value: 0,
			value_min: 0,
			value_max: 1,
			x: 20,
			y: 5
		},
		{
			label: 'TITLE',
			type: 'string',
			on_update: function() {
				beta_k.song.title = this.value;
			},
			value: new_song.title,
			length: 16,
			x: 2,
			y: 3,
		},
		{
			label: 'ARTIST',
			type: 'string',
			on_update: function() {
				beta_k.song.artist = this.value;
			},
			value: new_song.artist,
			length: 16,
			x: 2,
			y: 4,
		},
		{
			label: 'COPY INFO',
			type: 'string',
			on_update: function() {
				beta_k.song.copy_info = this.value;
			},
			value: new_song.copy_info,
			length: 16,
			x: 2,
			y: 5,
		},
		],
		
		global_keys: [{
			// space
			// pause song
			key: 32,
			on_update: function() {
				beta_k.pause = !beta_k.pause;
				if (beta_k.pause == true) beta_k.song_pause();
				else beta_k.song_play();
			}
		},{
			// backslash '\'
			// toggle root octave
			key: 220,
			on_update: function() {
				if (beta_k.octave == 0) beta_k.octave = 1;
				else beta_k.octave = 0;
				inputs.set_value('OCTAVE', beta_k.octave);
			}
		}],
	},
	/*
	 * methods
	 */

	init: function() {
		vixxen.screen.clear();
		vixxen.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		vixxen.plot_str(2, 8, 'ch1 ch2 ch3 ch4  SongonG0NGg  SPD VOL', 1);
		this.song = this.song_new();
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
		return JSON.parse(JSON.stringify(new_song));
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

