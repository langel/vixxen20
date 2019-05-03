/*

	VIXXEN Input Handler Library

*/
/*
 * hell yeah keyboard shortcuts like a real tracker
 */

window.addEventListener('blur', function() {
	console.log('blur')
	inputs.mod.shift = false;
	inputs.mod.control = false;
	inputs.key_state = [];
});

document.body.onkeydown = function(e) {
	e.preventDefault();
	inputs.key_last = e.keyCode;
	if (typeof inputs.key_state[e.keyCode] === 'undefined') {
		if (e.keyCode == SPKEY.SHIFT) inputs.mod.shift = true;
		else if (e.keyCode == SPKEY.CONTROL || e.keyCode == SPKEY.META) inputs.mod.control = true;
		else inputs.key_state[e.keyCode] = {
			frames: 0,
			input: e.key,
			code: e.keyCode,
		};
	}
};

document.body.onkeyup = function(e) {
	if (e.keyCode == SPKEY.SHIFT) inputs.mod.shift = false;
	else if (e.keyCode == SPKEY.CONTROL || e.keyCode == SPKEY.META) inputs.mod.control = false;
	else delete inputs.key_state[e.keyCode];
};

const SPKEY = {
	ALT: 18,
	ARROW_DOWN: 40,
	ARROW_LEFT: 37,
	ARROW_RIGHT: 39,
	ARROW_UP: 38,
	CAPSLOCK: 20,
	CONTROL: 17,
	BACKSPACE: 8,
	DASH: 189,
	DELETE: 46,
	END: 35,
	ENTER: 13, 
	EQUAL: 187,
	ESCAPE: 27,
	HOME: 36,
	INSERT: 45,
	META: 18,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	SHIFT: 16,
	TAB: 9,
};

const HEXKEY = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 81, 87, 69, 82, 84, 89];

const input_styles = {
	/*
	Color Codes

	0 Black  4 Purple
	1 White  5 Green
	2 Red    6 Blue
	3 Cyan   7 Yellow
	*/
	// XXX not implemented yet :(
	// but it is being implemented right now
	// this could be kernel level color themes
	// color, inverse
	blur: [1, 0],
	focus: [5, 1],
	block: [3, 1],
	highlight: [2, 0],
	muted: [2, 0],
};

var inputs = {
/*
	all inputs are grids of cells
	scrollable
	selectable

	field object = {
		// required location on screen of input
		pos: {
			x: int,
			y: int
		},
		// scroll position of input
		// defaults to 0,0
		scroll: {
			x: int,
			y: int
		},
		// required actual size of data
		size: {
			x: int,
			y: int
		},
		// optional actual size of visible input
		// if not defined window == size
		// if window larger than size then scrolling occurs
		window: {
			x: int,
			y: int
		},
		// input cell properties
		value_default: various,
		// required display method
		value_display: string(dec/hex/custom),
		value_min: int,
		value_max: int,
		cell_props: {
			// required number of characters wide
			width: int,
			// optional space between columns 
			margin_x: int,
			// optional space between rows
			margin_y: int,
			// optional coloring cells
			style: string(inputs.style{}/default=='blur')
		}
	};

	input handler needs to populate data

*/


};

