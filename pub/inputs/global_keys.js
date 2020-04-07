inputs.global_keys = [{
	// tab
	// move to next input
	key: 9,
	on_update: function() {
		inputs.next();
	},
},{
	// shift tab
	// widdershins to previous input
	key: 'SHIFT_9',
	on_update: function() {
		inputs.previous();
	},
},{
	// control tab 
	// toggle video refresh rate
	key: 'CONTROL_192',
	on_update: function() {	
    let mode = (vic.video_mode !== 'ntsc') ? 'ntsc' : 'pal';
    vic.set_video_mode(mode);
		console.log('VIDEO MODE ' + vic.video_mode);
	},
},{
	// control capslock 
	// toggle through character sets
	key: 'CONTROL_20',
	on_update: function() {	
		var block = vic.char_rom_block;
		block++;
		if ((block+1) * vic.char_rom_block_size > char_rom.length) block = 0;
		vic.set_char_rom_block(block);
		console.log('CHAR ROM BLOCK ' + block);
	},
},{
	// control escape
	// reboot vixxen20
	key: 'CONTROL_SHIFT_220',
	on_update: function() {
		location.reload();
	},
},{
	// control open bracket
	// decrease audio buffer
	key: 'CONTROL_SHIFT_219',
	on_update: function() {
		vic.audio_buffer_size--;
		vic.build_audio_buffer();
	}
},{
	// control closing bracket
	// increase audio buffer
	key: 'CONTROL_SHIFT_221',
	on_update: function() {
		vic.audio_buffer_size++;
		vic.build_audio_buffer();
	}
}];
