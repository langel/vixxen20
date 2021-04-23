// MAKE IT SING

var baby_k = {

	includes: [
		'song_schema',
		'input_pattern',
		'input_song',
		'inputs',
	],

	/*
	 * parameters
	 */

	follow_mode: true,
	frame_counter: 0,
	frame_rate: 6,
	inputs: {},
	notice_counter: 0,
	octave: 0,
	pattern_length: 16,
	pattern_max_id: 127,
	pattern_pos: 0,
	song_pos: 0,
	song_max_length: 128,
	pattern_grid_song_pos: 0,
	pause: true,
	play_mode: 0,
	play_modes: [
		'LOOPING',
		'PAUSED',
		'PLAYING',
		'STOPPED',
	],
	song: 'load a song dummy',
	tuning: 0,


	/*
	 * methods
	 */

	init: function() {
		// setup screen
		kernel.screen.clear();

		kernel.plot_str(0, 1, ' BABY-K on VIXXEN20 ', 5);
		kernel.plot_str(20, 3, 'SPEED', 1);
		kernel.plot_str(20, 4, 'VOLUME', 1);
		//kernel.plot_str(20, 5, 'OCTAVE', 1);
		// 'OCTAVE' on row 5
		kernel.plot_str(20, 6, 'S.ROW', 1);
		this.update_song_row_display(0);

		kernel.plot_str(30, 3, ' ALTO ', 1);
		kernel.plot_str(30, 4, ' TENR ', 1);
		kernel.plot_str(30, 5, ' SOPR ', 1);
		kernel.plot_str(30, 6, ' NUZZ ', 1);
		kernel.plot_str(2, 8, 'ch1 ch2 ch3 ch4  Songond0NGg  SPD VOL', 1);
		// setup components
		this.song = this.song_new();
		this.inputs = baby_k_inputs;
		this.inputs.init();
		inputs.init(this.inputs);
		this.speed_grid = inputs.get_field_by_label('SPEED');
		this.volume_grid = inputs.get_field_by_label('VOLUME');
		kernel.frame.hook_add({
			object: 'baby_k',
			method: 'frame'
		});
	},

	frame: function() {
		// display video mode
		kernel.plot_str(35, 1, vic.video_mode.toUpperCase()+' ', 6);
		// handle notice text row
		if (baby_k.notice_counter == 0) {
			kernel.plot_str(1, 28, `PR ${kernel.display.hex(baby_k.pattern_pos - 1)} SR ${kernel.display.hex_byte(baby_k.song_pos)} FRAME ${baby_k.frame_counter - 1} `, 2);
			kernel.plot_str(27, 28, 'LAST KEY ' + inputs.key_last + ' ', 2);
		}
		else baby_k.notice_counter--
		if (baby_k.notice_counter == 1) {
			baby_k.notice_counter = 0;
			kernel.plot_str(1, 28, '                                  ', 0);
		}
		// handle playback
		if (baby_k.pause !== true) {
			// play next row after frame count
			if (this.frame_counter >= baby_k.frame_rate) {
				this.frame_counter = 0;
				this.play_next_row();
				// update displays
				for (var i = 0; i < 4; i++) {
					var display = (vic.voices[i].value >= 128) ? kernel.display.hex(vic.voices[i].value) : '--';
					kernel.plot_str(36, 3+i, display, 1);
				}
			}
		}
		baby_k.frame_counter++;
	},

	notice: function(text) {
		kernel.plot_str(1, 28, kernel.display.pad(text, 38, ' '), 2);
		baby_k.notice_counter = 100;
	},

	play_next_order: function() {
		let next_row = this.song_grid.get_next_row();
		if (this.follow_mode) {
			this.song_grid.set_current_row(next_row);
			this.pattern_grid_song_pos = this.song_pos;
			this.pattern_grid.load_patterns(this.pattern_grid_song_pos);
			inputs.types.grid.cell_advance(this.song_grid, 'down');
		}
		else {
			inputs.types.grid.row_dehighlight(this.pattern_grid);
		}
	},
	
	play_next_row: function() {
		// play next song position after pattern
		if (this.pattern_pos >= this.pattern_length) {
			this.pattern_pos = 0;
			this.play_next_order();
		}
		// get pattern order row
		var pattern_order_row = baby_k.song.pattern_order[this.song_pos];
		// act on pattern row data
		for (var i = 0; i < 4; i++) {
			var current_pattern = (pattern_order_row[i] != 255) ? this.song.patterns[pattern_order_row[i]] : baby_k_new_pattern;
			var value = current_pattern[this.pattern_pos];
			// PITCH DATA
			if (value >= 128) {
				vic.set_voice_value(i, value);
			}
			// NOTE OFF
			else if (value == 1) {
				vic.set_voice_value(i, 0);
			}
			// NEXT PATTERN
			else if (value == 2) {
				// there's a smarter way to do this...
				//this.pattern_pos = this.pattern_length;
				this.play_next_order();
			}
			// END SONG
			else if (value == 3) {
				this.song_stop();
			}
			// act on speed table data
			this.frame_rate = this.song.speed_table[this.pattern_pos];
			kernel.plot_str(26, 3, kernel.display.pad(this.frame_rate, 3, ' '), 1);
			// act on volume table data
			vic.set_volume(this.song.volume_table[this.pattern_pos]);
			kernel.plot_str(26, 4, kernel.display.pad(vic.volume, 3, ' '), 1);
			// highlight appropriate rows
			inputs.types.grid.row_highlight(this.speed_grid, this.pattern_pos);
			inputs.types.grid.draw_all(this.speed_grid);
			inputs.types.grid.row_highlight(this.volume_grid, this.pattern_pos);
			inputs.types.grid.draw_all(this.volume_grid);
		}
		if (this.song_pos == this.pattern_grid_song_pos) {
			let field = inputs.get_field_by_label('PATTERN');
			inputs.types.grid.row_highlight(field, this.pattern_pos);
			field.cell.y = this.pattern_pos;
			inputs.types.grid.draw_all(field);
		}
		this.pattern_pos++;
	},

	play_status: function(status) {
		kernel.plot_str(22, 1, ` ${status}   `, 1);
	},

	song_new: function() {
		return JSON.parse(JSON.stringify(baby_k_new_song));
	},

	song_pause: function() {
		baby_k.pause = true;
		kernel.silent();	
		this.play_status('PAUSED');
		return;
	},

	song_play: function() {
		baby_k.pause = false;
		this.play_status('PLAYING');
		inputs.types.grid.row_highlight(inputs.get_field_by_label('SONG'), this.song_pos);
	},

	song_play_pattern: function() {
		baby_k.pause = false;
		this.play_status('PLAYING');
	},

	song_stop: function() {
		baby_k.pause = true;
		kernel.silent();	
		this.pattern_pos = 0;
		this.play_status('STOPPED');
	},

	toggle_follow_mode: function() {
		baby_k.follow_mode = !baby_k.follow_mode;
		let log = 'Follow Mode ';
		log += (baby_k.follow_mode) ? 'Enabled' : 'Disabled';
		baby_k.notice(log);
		if (baby_k.follow_mode && !baby_k.pause) {
			this.pattern_grid_song_pos = this.song_pos;
			this.pattern_grid.load_patterns(this.pattern_grid_song_pos);
		}
	},

	update_song_row_display: function(value) {
		kernel.plot_str(27, 6, kernel.display.pad(kernel.display.hex(value), 2, '0'), 1);
	},

	play_position: {
		list: 0,
		row: 0,
		increase: function() {
			this.row++;
			if (this.row >= 16) {
				this.row = 0;
				this.list++;
				if (this.list >= baby_k.song.list.length) this.list = 0;
			}
		},
	},


}

