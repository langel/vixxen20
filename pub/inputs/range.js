inputs.types.range = {
	on_key: function(field, key) {
		if (key == KEY_ARROW_UP) {
			field.value++;
			if (field.value > field.value_max) field.value = field.value_max;
		}
		if (key == KEY_ARROW_DOWN) {
			field.value--;
			if (field.value < field.value_min) field.value = field.value_min;
		}
	}
}
