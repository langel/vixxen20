/*
	the VIXXEN booter

	boot screen and (eventually) a warez loader menu

*/


var booter = {

	counter: 0,

	init: function() {
		vic.set_volume(3);
		kernel.frame.hook_add({
			object: 'booter',
			method: 'frame'
		});
	},

	frame: function() {
		if (this.counter < 128) {
			var print_color = this.counter % 7 + 1;
			kernel.cursor.print('VIXXEN20 ', print_color);
			kernel.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)), print_color);
			kernel.cursor.print(String.fromCharCode(Math.floor(Math.random()*32)+96) + ' ', print_color);
			this.counter++;
			vic.set_voice_value(0, this.counter + 128);
			vic.set_voice_value(1, this.counter + 128);
			vic.set_voice_value(2, this.counter + 128);
			vic.set_voice_value(3, this.counter + 128);
		}
		else {
			vic.set_voice_value(0, 0);
			vic.set_voice_value(1, 0);
			vic.set_voice_value(2, 0);
			vic.set_voice_value(3, 0);
			kernel.screen.clear();
			kernel.plot_str(11, 11, 'V I X X E N   2 0 ', 5);


			// XXX menu should be launched here
			kernel.frame.hook_remove_all();


			// loading beta-k manually
			kernel.load('baby_k');

		}
	}
}
