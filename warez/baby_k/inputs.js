var baby_k_inputs = {

	
	global_keys: [{
		// space
		// pause song
		key: 32,
		on_update: function() {
			baby_k.pause = !baby_k.pause;
			if (baby_k.pause == true) baby_k.song_pause();
			else baby_k.song_play();
		}
	},{
		// backslash '\'
		// toggle root octave
		key: 220,
		on_update: function() {
			if (baby_k.octave == 0) baby_k.octave = 1;
			else baby_k.octave = 0;
			inputs.set_value('OCTAVE', baby_k.octave);
		}
	},{
		// Ctrl-O open
		key: 'CONTROL_79',
		on_update: function() {
			disk.open(function(data) {
				baby_k.song = JSON.parse(data);
			});
		}
	},{
		// Ctrl-S save
		key: 'CONTROL_83',
		on_update: function() {
			disk.save_new(JSON.stringify(baby_k.song));
		}
  },{
		// apastrophe ''' 
		// rotate through tunings
		key: 222,
		on_update: function() {
			baby_k.tuning++;
			if (baby_k.tuning > baby_k_scales.length - 1) baby_k.tuning = 0;
			baby_k.song.tuning = baby_k.tuning;
			var pattern = inputs.get_field_by_label('PATTERN');
			inputs.types.grid.draw_all(pattern);
			var text = baby_k_scales[baby_k.tuning].display_name + ' tuning now in use.';
			console.log(text);
			baby_k.notice(text);
		}
	}],

	init: function() {

		this.fields = [
			baby_k_input_pattern,
			baby_k_input_song,
			{
				label: 'SPEED',
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
					baby_k.song.speed_table[this.cell.y] = this.value;
				},
			},	
			{
				label: 'VOLUME',
				type: 'grid',
				cell_width: 1,
				cell_height: 1,
				cell_margin: 1,
				cell_type: 'hex',
				cell_value: 7,
				width: 1,
				height: 16,
				x: 37,
				y: 10,
				value_min: 0,
				value_max: 15,
				on_update: function() {
					baby_k.song.volume_table[this.cell.y] = this.value;
				},
			}, 
			{
				label: 'OCTAVE',
				type: 'range',
				on_update: function() {
					baby_k.octave = this.value;
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
					baby_k.song.title = this.string;
				},
				value: baby_k_new_song.title,
				length: 16,
				x: 2,
				y: 3,
			},	
			{
				label: 'ARTIST',
				type: 'string',
				on_update: function() {
					baby_k.song.artist = this.string;
				},
				value: baby_k_new_song.artist,
				length: 16,
				x: 2,
				y: 4,
			},	
			{
				label: 'COPY INFO',
				type: 'string',
				on_update: function() {
					baby_k.song.copy_info = this.string;
				},
				value: baby_k_new_song.copy_info,
				length: 16,
				x: 2,
				y: 5,
			}
		]
	}
};
