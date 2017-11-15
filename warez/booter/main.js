/*
	the VIXXEN booter

	boot screen and (eventually) a warez loader menu

*/


var booter = {

	counter: 0,

	init: function() {
		vixxen.screen.clear();
		vic.set_volume(3);
		vixxen.frame.hook_add({
			object: 'booter',
			method: 'frame'
		});
	},

	frame: function() {
		// XXX boot animation should be it's own function
		console.log(this.boot);
		if (this.boot < 128) {
			var print_color = this.boot % 7 + 1;
			vixxen.cursor.print('VIXXEN20 ', print_color);
			vixxen.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)), print_color);
			vixxen.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)+96) + ' ', print_color);
			this.boot++;
			vic.set_voice_value(0, this.boot + 128);
			vic.set_voice_value(1, this.boot + 128);
			vic.set_voice_value(2, this.boot + 128);
			vic.set_voice_value(3, this.boot + 128);
			setTimeout(bootscroll, vic.get_frame_ms); 
		}
		else {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			vixxen.screen.clear();
			vic.plot_str(0, 1, ' V I X X E N   2 0 ', 5);
			// XXX menu should be launched here
			vixxen.frame.hook_remove_all();
			// loading beta-k manually
			vixxen.load('beta_k');
			beta_k.init();
		}
	}
}
