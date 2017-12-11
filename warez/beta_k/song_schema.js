/*
 * VIC20 Song Data Schema


	BETA-K MEMORY MAP

		1000-1DFF	complete program space address

		1000-10xx	BASIC SYS call to start program
		10XX-13AF	~928 bytes for player
		13B0-13BF	16 char string	'title'
		13C0-13CF	16 char string	'artist'
		13D0-13DF	16 char string	'copyright/info'
		13E0-13EF	16 row speed table
		13F0-13FF	16 row volume table
		1400-1BFF	128 16 row patterns
		1C00-1DFF	128 rows pattern order list
		         	4 bytes per row for all 4 channels


	Pattern Object - 16 bytes each

		value h80-hFF	pitch value
		value h00	do nothing
		value h01	note OFF
		value h02	jump to NXT song row
		value h03	END playback
		// XXX ...potential effects...
		// depends on space restraints of player
		value h1x	pitch slide up by x per frame
		value h2x	pitch slide down by x per frame
		value h3x	pitch slide up by x per row
		value h4x	pitch slide down by x per row
		...etc.
*/


var beta_k_new_pattern = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
var beta_k_new_song_order = [];
for (var i = 0; i < 128; i++) {
	if (i == 0) beta_k_new_song_order.push([0,1,2,3]);
	else beta_k_new_song_order.push([0,0,0,0]);
}
console.log(beta_k_new_song_order);

var beta_k_new_song = {
	title: 'Title',
	artist: 'Artist',
	copy_info: 'Copy Info',
	pattern_order: beta_k_new_song_order,
	patterns: [
		beta_k_new_pattern,
		beta_k_new_pattern,
		beta_k_new_pattern,
		beta_k_new_pattern,
	],
	speed_table: [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
	volume_table: [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
};

var beta_k_note_values = [
	131,140,145,151,158,161,166,173,178,181,185,189,
	192,197,200,203,206,208,211,214,216,218,220,222,
	224,226,227,229,231,232,233,234,236,237,238,239,
	240,241
];

var beta_k_note_keycodes = [
	// bottom row
	90,83,88,68,67,86,71,66,72,78,74,77,
	// top row
	81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80
];

var beta_k_note_names = ['C ','C#','D ','D#','E ','F ','F#','G ','G#','A ','A#','B '];

var beta_k_note_specials = ['---','OFF','NXT','END'];

var beta_k_note_values = [
	131,140,145,151,158,161,166,173,178,181,185,189,
	192,197,200,203,206,208,211,214,216,218,220,222,
	224,226,227,229,231,232,233,234,236,237,238,239,
	240,241
];


/* original startup pattern */
patterns = {
	length: 16,
	data:	[[
		200,
		200,
		200,
		200,
		129,
		129,
		129,
		129,
		129,
		129,
		129,
		128,
		0,
		0,
		0,
		0
	],	[
		0,
		0,
		0,
		0,
		200,
		0,
		200,
		0,
		200,
		0,
		0,
		0,
		200,
		0,
		200,
		0
	],	[
		128,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		200,
		0,
		155,
		0,
		155,
		0,
		0,
		155
	],	[
		140,
		129,
		0,
		0,
		155,
		0,
		254,
		0,
		200,
		220,
		0,
		0,
		155,
		0,
		254,
		0
	]]
};

