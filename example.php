<?php
$socket = fsockopen('unix://sds.sock');
fwrite(
    $socket, 
    implode(
	"\n", 
	[ 
	    'https://domain.tld/somefile.ext', 
	    '/path/to/target/file'
	]
    ) 
    . "\n\n" 
);
