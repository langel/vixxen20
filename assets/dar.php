<?php


$filename = 'char_rom.bin';
$filesize = filesize($filename);
$handle = fopen($filename, "r");
$contents = fread($handle, $filesize);
fclose($handle);

echo strlen($contents);

$data = [];

$output = "var char_rom = [\n";
$c = 0;
for ($i=0; $i<$filesize; $i++) {
	$output .= ord(substr($contents, $i, 1)).', ';
	$c++;
	if ($c == 8) {
		$output .= "\n";
		$c = 0;
	}
}

echo(json_encode($data));
$fp = fopen('char_rom.js', 'w');
fwrite($fp, $output);
fclose($fp);
