<?php


$filename = 'char_rom.bin';
$filesize = filesize($filename);
$handle = fopen($filename, "r");
$contents = fread($handle, $filesize);
fclose($handle);

echo('Converting '.(strlen($contents)/8)." characters\n");

$output = "var char_rom = [\n";
$c = $ascii = 0;
for ($i=0; $i<$filesize; $i++) {
	if ($c == 0) $output .= '// '.$ascii."\n";
	$output .= '0b'.sprintf('%08b', ord(substr($contents, $i, 1))).",\n";
	$c++;
	if ($c == 8) {
		$output .= "\n";
		$c = 0;
		$ascii++;
	}
}
$output .= '];';

$fp = fopen('char_rom.js', 'w');
fwrite($fp, $output);
fclose($fp);
