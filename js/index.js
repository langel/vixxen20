// MAKE IT SING
$(()=>{init();});

init = () => {

//	alert("hello ass");


console.log(stdout);


	vic.set_volume(3);

	var i = 128;
	var pitched = function() {
		i++;
		vic.set_voice('bass', i);
		vic.set_voice('alto', i);
		vic.set_voice('sopr', i);
		vic.set_voice('nois', i);
		if (i < 256) window.setTimeout(pitched, vic.framerate[vic.video_standard]*8);
		else vic.set_volume(0);
	};
	pitched();
}
