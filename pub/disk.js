// XXX how does saving work?

const {dialog} = require('electron').remote;
const fs = require('fs');


var disk = {

	file_filter: [
		{name: 'VIXXEN20 Data', extensions: ['v2d']},
	],

	'open': function(callback) {
		dialog.showOpenDialog({filters:disk.file_filter}, function(files) {
			if (files === undefined) console.log('no file selected');
			else {
				callback(fs.readFileSync(files[0]));
				console.log('loaded ' + files[0]);
			}
		});
	},

	'save_changes': function(file_path, content) {
		return fw.writeFileSync(filename, content, function(err) {
			if (err) console.log('error updating files');
			else console.log('saved ' + file_path);
		});
	},

	'save_new': function(content) {
		return dialog.showSaveDialog({filters:disk.file_filter}, function(filename) {
			if (filename === undefined) {
				console.log('filename undefined :(');
				return;
			}
			fs.writeFileSync(filename, content, function(err) {
				if (err) console.log('error creating file');
				else console.log('file saved');
			});
		});
	},

};
