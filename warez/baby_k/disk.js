let disk = {

	file_type: {
		name: 'BABY-K Song',
		extensions: ['bks'],
	},

	method_export: function(song) {
		console.log('export?');
		console.log(song);
		// create enough ROM space wow :D/
		let data = new Uint8Array(2640);
		// do all the 16 byte fields
		for (let i = 0; i < 16; i++) {
			data[i] = song.title.charCodeAt(i);
			data[16 + i] = song.artist.charCodeAt(i);
			data[32 + i] = song.copy_info.charCodeAt(i);
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
		const song_data = new Blob([data], {type: "application/octet-stream"});
		console.log(song_data);
		this.save_local(song_data, 'songdata.bin');
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

}
