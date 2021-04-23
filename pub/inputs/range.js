inputs.types.range = {

	on_key: function(field, key) {
		if (key.label == SPKEY.ARROW_UP) {
			field.value++;
			if (field.value > field.value_max) field.value = field.value_max;
		}
		if (key.label == SPKEY.ARROW_DOWN) {
			field.value--;
			if (field.value < field.value_min) field.value = field.value_min;
		}
	}

}
