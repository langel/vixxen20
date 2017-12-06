var beta_k_inputs = {

	
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


	fields: [{

		label: 'SPEED LOOP EDITOR',

		type: 'grid',

		cell_width: 1,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'hex',
		cell_value: 5,

		width: 1,
		height: 16,

		x: 33,
		y: 10,

		value_min: 1,
		value_max: 15,

		on_update: function() {
		},

	},	{

		label: 'VOLUME LOOP EDITOR',

		type: 'grid',

		cell_width: 1,
		cell_height: 1,
		cell_margin: 1,
		cell_type: 'hex',
		cell_value: 5,

		width: 1,
		height: 16,

		x: 37,
		y: 10,

		value_min: 0,
		value_max: 15,

		on_update: function() {
		},

	}, {

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
	},	{
	
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
	},	{

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
	},	{

		label: 'TITLE',
		type: 'string',
		on_update: function() {
			beta_k.song.title = this.value;
		},
		value: beta_k_new_song.title,
		length: 16,
		x: 2,
		y: 3,
	},	{

		label: 'ARTIST',
		type: 'string',
		on_update: function() {
			beta_k.song.artist = this.value;
		},
		value: beta_k_new_song.artist,
		length: 16,
		x: 2,
		y: 4,
	},	{

		label: 'COPY INFO',
		type: 'string',
		on_update: function() {
			beta_k.song.copy_info = this.value;
		},
		value: beta_k_new_song.copy_info,
		length: 16,
		x: 2,
		y: 5,
	}]
		
};
