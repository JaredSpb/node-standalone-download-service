#!/bin/sh
echo "https://domain.tld/somefile.ext
/path/to/target/file

" | socat - UNIX-CONNECT:sds.sock
