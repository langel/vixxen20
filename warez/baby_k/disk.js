let disk = {

	file_type: {
		name: 'BABY-K Song',
		extensions: ['bks'],
	},

	method_export_program: function(song) {
		console.log('export song program?');
		// program loads in at $1000
		// song data should start at $13b0
		// add two bytes (word address) for program start position
		// song data starts at byte 946 in export
		const song_start_at = 946
		const forty_two = 42;
		let head = new Uint8Array(song_start_at).fill(forty_two);
		playroutine_bin.map((val, i) => { head[i] = val; });
		let data = this.song_to_blob_ready_data(song);
		const song_data = new Blob([head, data], {type: "application/octet-stream"});
		this.save_local(song_data, 'songdata.prg');
		baby_k.notice('Runtime Binary Exported to Cornputer');
	},

	method_export_data: function(song) {
		console.log('export data?');
		let data = this.song_to_blob_ready_data(song);
		const song_data = new Blob([data], {type: "application/octet-stream"});
		console.log(song_data);
		this.save_local(song_data, 'songdata.bin');
		baby_k.notice('Song Data Exported to Cornputer');
	},

	method_save_local_drive: function(song) {
		this.save_local(new Blob([JSON.stringify(baby_k.song)], {type: "application/json"}), 'songdata.json');
		baby_k.notice('Song Data Donloaded to Cornputer');
	},

	method_save_localstorage: function(song) {
		let localstorage = window.localStorage;
		localstorage.setItem('baby_k.song', song);
		baby_k.notice('Song Saved to Browser');
	},

	save_local: function(blob, filename) {
		// check for hidden anchor element
		let a = document.getElementById('save_local');
		if (a === null) {
			a = document.createElement('a');
			a.setAttribute('id', 'save_local');
			document.body.appendChild(a);
			a.style = "display: none";
		}
		// setup hidden anchor element
		url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = filename;
		// force that shit
		a.click();
		window.URL.revokeObjectURL(url);
	},

	song_to_blob_ready_data: function(song) {
		console.log('convert?');
		console.log(song);
		// create enough ROM space wow :D/
		let data = new Uint8Array(2640);
		// convert strings for vic 20 usage
		let title = kernel.ascii2petscii(song.title);
		let artist = kernel.ascii2petscii(song.artist);
		let copy_info = kernel.ascii2petscii(song.copy_info);
		// do all the 16 byte fields
		for (let i = 0; i < 16; i++) {
			data[i] = title.charCodeAt(i);
			data[16 + i] = artist.charCodeAt(i);
			data[32 + i] = copy_info.charCodeAt(i);
			data[48 + i] = song.speed_table[i];
			data[64 + i] = song.volume_table[i];
		}
		// pattern and song data
		for (let i = 0; i < 128; i++) {
			// patterns start at 80
			for (let j = 0; j < 16; j++) {
				data[80 + i * 16 + j] = song.patterns[i][j];
			}
			// song rows start at 2128
			for (let j = 0; j < 4; j++) {
				data[2128 + i * 4 + j] = song.pattern_order[i][j];
			}
		}
		console.log(data);
		return data;
	},

}
