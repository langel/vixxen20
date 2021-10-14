var baby_k_inputs = {

	
	global_keys: [{
		// pause 
		key: KEYS.SPACE,
		on_update: function() {
			if (inputs.get_current_field_type() == 'string') return;
			baby_k.pause = !baby_k.pause;
			if (baby_k.pause == true) baby_k.song_pause();
			else baby_k.song_play();
		}
	},{
		// toggle follow mode
		key: SPKEY.SCROLLLOCK,
		on_update: function() {
			baby_k.toggle_follow_mode();
		}
	},{
		// toggle follow mode
		key: KEYS.COMMA,
		on_update: function() {
			if (inputs.get_current_field_type() == 'string') return;
			baby_k.toggle_follow_mode();
		}
	},{
		// toggle root octave
		key: KEYS.BACKSLASH,
		on_update: function() {
			if (baby_k.octave == 0) baby_k.octave = 1;
			else baby_k.octave = 0;
			inputs.set_value('OCTAVE', baby_k.octave);
		}
	},{
		// set root octave to 0
		key: KEYS.NUM_SLASH,
		on_update: function() {
			if (inputs.get_current_field_type() == 'string') return;
			baby_k.octave = 0;
			inputs.set_value('OCTAVE', baby_k.octave);
		}
	},{
		// set root octave to 1
		key: KEYS.NUM_ASTERISK,
		on_update: function() {
			if (inputs.get_current_field_type() == 'string') return;
			baby_k.octave = 1;
			inputs.set_value('OCTAVE', baby_k.octave);
		}
	},{
		// Ctrl-Shift-D load Demo groove
		key: 'CONTROL_SHIFT_68',
		on_update: function() {
			baby_k.load_song(JSON.parse(JSON.stringify(baby_k_demo_song)));
			baby_k.notice('New FRESH!! :9');
		}
	},{
		// Ctrl-E export prg/bin
		key: 'CONTROL_69',
		on_update: function() {
			disk.method_export_program(baby_k.song);
			baby_k.notice('Runtime Binary Exported to Cornputer');
		}
	},{
		// Ctrl-Shift-E export binary song data only
		key: 'CONTROL_SHIFT_69',
		on_update: function() {
			disk.method_export_data(baby_k.song);
			baby_k.notice('Song Data Exported to Cornputer');
		}
	},{
		// Ctrl-F new Fresh song
		key: 'CONTROL_70',
		on_update: function() {
			baby_k.load_song(baby_k.song_new());
			baby_k.notice('New FRESH!! :9');
		}
	},{
		// Ctrl-O open
		key: 'CONTROL_79',
		on_update: function() {
			baby_k.notice('Drag file into this window! :D');
		}
	},{
		// Ctrl-R revert
		key: 'CONTROL_82',
		on_update: function() {
			baby_k.song = disk.method_load_localstorage();
			baby_k.notice('Song Reverted from Browser');
			// XXX and some load actions?
		}
	},{
		// Ctrl-S save
		key: 'CONTROL_83',
		on_update: function() {
			disk.method_save_localstorage(baby_k.song);
			baby_k.notice('Song Saved to Browser');
		}
  },{
		// Ctrl-Shift-S save
		key: 'CONTROL_SHIFT_83',
		on_update: function() {
			disk.method_save_local_drive(baby_k.song);
			baby_k.notice('Song Data Donloaded to Cornputer');
		}
  },{
		// rotate through tunings
		key: KEYS.APOSTROPHE,
		on_update: function() {
			if (inputs.get_current_field_type() == 'string') return;
			var field = this.fields[this.field_index];
			if (field.type == 'string') return;
			baby_k.tuning++;
			if (baby_k.tuning > baby_k_scales.length - 1) baby_k.tuning = 0;
			baby_k.song.tuning = baby_k.tuning;
			var pattern = inputs.get_field_by_label('PATTERN');
			inputs.types.grid.draw_all(pattern);
			var text = baby_k_scales[baby_k.tuning].display_name + ' tuning now in use.';
			console.log(text);
			baby_k.notice(text);
		}
	},{
		// next row of song
		key: 'CONTROL_SHIFT_'+SPKEY.ARROW_DOWN,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.ARROW_DOWN});
		}
	},{
		// previous row of song
		key: 'CONTROL_SHIFT_'+SPKEY.ARROW_UP,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.ARROW_UP});
		}
	},{
		// skip 4 rows ahead in song
		key: 'CONTROL_SHIFT_'+SPKEY.ARROW_RIGHT,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.PAGE_DOWN});
		}
	},{
		// skip 4 rows behind in song
		key: 'CONTROL_SHIFT_'+SPKEY.ARROW_LEFT,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.PAGE_UP});
		}
	},{
		// beginning of song
		key: 'CONTROL_SHIFT_'+SPKEY.HOME,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.HOME});
		}
	},{
		// skip 4 rows behind in song
		key: 'CONTROL_SHIFT_'+SPKEY.END,
		on_update: () => {
			inputs.types.grid.on_key(baby_k.song_grid, {label:SPKEY.END});
		}
	}],

	init: function() {

		baby_k.pattern_grid = baby_k_input_pattern;
		baby_k.song_grid = baby_k_input_song;

		this.fields = [
			baby_k.pattern_grid,
			baby_k.song_grid,
			{
				label: 'SPEED',
				type: 'grid',
				cell_width: 1,
				cell_height: 1,
				cell_margin: 1,
				cell_type: 'hex',
				value_default: 5,
				width: 1,
				height: 16,
				x: 33,
				y: 10,
				value_min: 1,
				value_max: 15,
				on_init: function() {
					this.data[0] = baby_k.song.speed_table;
				},
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
				value_default: 7,
				width: 1,
				height: 16,
				x: 37,
				y: 10,
				value_min: 0,
				value_max: 15,
				on_init: function() {
					this.data[0] = baby_k.song.volume_table;
				},
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
				value: baby_k.song.title,
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
				value: baby_k.song.artist,
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
				value: baby_k.song.copy_info,
				length: 16,
				x: 2,
				y: 5,
			}
		]
	}
};
