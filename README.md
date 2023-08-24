# Standalone Download Service

This is a simple service that just downloads files and saves them to the location specified. It is supposed to be used by another software in a fire-and-forget style. SDS opens a unix socket and runs download-save process for requests recieved through this socket.

## Installation

Clone the repo:

`git clone https://github.com/JaredSpb/node-standalone-download-service`

Install deps:

`npm install`

Get command line args quote:

`node index.js --help`

Or run with default params:

`node index.js`


## Usage

By default the `sds.sock` is created in the current working directory. SDS accepts requests from this socket in the following format:

```
URL
/local/path/to/save/file/to

```

The "\n" line feed to split url from path, double line feed to split requests from each other.

For example, with bash:
```
echo "https://domain.tld/somefile.ext
/path/to/target/file

" | socat - UNIX-CONNECT:sds.sock
```

Or with PHP:

```php
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
```

## Notes

The download process is asynchronous and is throttled. By default 4 workers at a time with a 2 seconds interval (next four downloads will be started every 2 seconds if previous ones are finished). This can be changed with SDS command line args.


