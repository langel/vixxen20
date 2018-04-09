// MAKE IT SING

var beta_k = {

	includes: [
		'song_schema',
		'inputs',
	],

	/*
	 * parameters
	 */

	frame_counter: 0,
	frame_rate: 5,
	inputs: {},
	octave: 0,
	pattern_length: 16,
	pattern_pos: 0,
	pattern_order_pos: 0,
	play_mode: 0,
	play_modes: [
		'LOOPING',
		'PAUSED',
		'PLAYING',
		'STOPPED',
	],
	pause: true,
	song: 'load a song dummy',



	/*
	 * methods
	 */

	init: function() {
		// setup screen
		vixxen.screen.clear();
		vixxen.plot_str(0, 1, ' BETA-K ON VIXXEN20 ', 5);
		vixxen.plot_str(20, 3, 'SPEED', 1);
		vixxen.plot_str(20, 4, 'VOLUME', 1);
		vixxen.plot_str(30, 3, ' ALTO ', 1);
		vixxen.plot_str(30, 4, ' TENR ', 1);
		vixxen.plot_str(30, 5, ' SOPR ', 1);
		vixxen.plot_str(30, 6, ' NUZZ ', 1);
		vixxen.plot_str(2, 8, 'ch1 ch2 ch3 ch4  Songond0NGg  SPD VOL', 1);
		// setup components
		beta_k_inputs.init();
		this.song = this.song_new();
		this.inputs = beta_k_inputs;
		inputs.init(this.inputs);
		vixxen.frame.hook_add({
			object: 'beta_k',
			method: 'frame'
		});
		this.song_play_pattern();
	},

	frame: function() {
		// display video mode
		vixxen.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		if (beta_k.pause !== true) {
			// play next row after frame count
			if (this.frame_counter >= beta_k.frame_rate) {
				this.frame_counter = 0;
				this.play_next_row();
			}
			// update displays
			for (var i = 0; i < 4; i++) {
				var display = (vic.voices[i].value >= 128) ? vixxen.display.hex(vic.voices[i].value) : '--';
				vixxen.plot_str(36, 3+i, display, 1);
			}
		}
		beta_k.frame_counter++;
		vixxen.plot_str(0, 28, ` FRAME ${beta_k.frame_counter} `, 2);
	},

	play_next_order: function() {
		// loads next order of patterns
		// check if playing in song or pattern mode

		// get next pattern order row
		var next_order_row = beta_k.song.pattern_order[this.pattern_order_pos + 1];
		// make sure at least one pattern in row is populated
		var pop = 0;
		for (var i = 0; i < 4; i++) {
			if (next_order_row[i] != 255) pop++;
		}
		if (pop > 0) this.pattern_order_pos++;
		else this.pattern_order_pos = 0;
		inputs.get_field_by_label('PATTERN').load_patterns(this.pattern_order_pos);
	},
	
	play_next_row: function() {
		// play next song position after pattern
		if (this.pattern_pos >= this.pattern_length) {
			this.pattern_pos = 0;
			this.play_next_order();
		}
		// get pattern order row
		var pattern_order_row = beta_k.song.pattern_order[this.pattern_order_pos];
		// act on pattern row data
		for (var i = 0; i < 4; i++) {
			var current_pattern = (pattern_order_row[i] != 255) ? this.song.patterns[pattern_order_row[i]] : beta_k_new_pattern;
			var value = current_pattern[this.pattern_pos];
			// PITCH DATA
			if (value >= 128) {
				vic.set_voice_value(i, value);
			}
			// NOTE OFF
			if (value == 1) {
				vic.set_voice_value(i, 0);
			}
			// END SONG
			if (value == 3) {
				this.song_stop();
			}
			// NEXT PATTERN
			if (value == 2) {
				// there's a smarter way to do this...
				this.pattern_pos = this.pattern_length;
				this.play_next_row();
			}
			else {
				// act on speed table data
				this.frame_rate = this.song.speed_table[this.pattern_pos];
				vixxen.plot_str(26, 3, vixxen.display.pad(this.frame_rate, 3, ' '), 1);
				// act on volume table data
				vic.set_volume(this.song.volume_table[this.pattern_pos]);
				vixxen.plot_str(26, 4, vixxen.display.pad(vic.volume, 3, ' '), 1);
				// highlight appropriate rows
				inputs.types.grid.row_highlight(inputs.get_field_by_label('PATTERN'), this.pattern_pos);
				inputs.types.grid.row_highlight(inputs.get_field_by_label('SPEED'), this.pattern_pos);
				inputs.types.grid.row_highlight(inputs.get_field_by_label('VOLUME'), this.pattern_pos);
				inputs.types.grid.row_highlight(inputs.get_field_by_label('SONG'), this.pattern_order_pos);
			}
		}
		this.pattern_pos++;
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
		this.pattern_pos = 0;
		this.play_status('STOPPED');
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

