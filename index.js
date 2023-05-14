import stream from 'node:stream';
import pThrottle from 'p-throttle';
import * as net from 'net';
import * as fs from 'fs';
import axios, {isCancel, AxiosError} from 'axios';


let argv = process.argv.slice(2);
let params = {};

while( argv.length ){

	if( params.limit && params.socket )
		break;

	let arg = argv.shift();

	if( arg == '--help' ){
		help();
		process.exit();
	}

	if( arg.match(/^\d+$/) && !params.limit ){
		params.limit = parseInt(arg);
	} else if( arg.match(/^\d+$/) && !params.delay  ){
		params.delay = parseInt(arg);
	} else{
		params.socket = arg;
	}
}

if( !params.limit ) params.limit = 4;
if( !params.socket ) params.socket = 'sds.sock';
if( !params.delay ) params.delay = 500;




const throttle = pThrottle({
	limit: params.limit,
	interval: params.limit * params.delay
});
let worker = throttle( async function(url, target, queue) {

	console.log( `\tPending: ${queue.queueSize}` )
	console.log(`Running request for ${url} -> ${target} << `);

	axios({
		method: 'get',
		url: url,
		responseType: 'arraybuffer'
	})
		.then( (r) => {
			fs.appendFile(target, Buffer.from(r.data), (e) => {
				if( e ) console.log(e, 'ERR');
			});
		})
		.catch(function (error) {
			console.log(`Request for ${url} failed with: ${error.code}`);
		});

} );

let listener = net.createServer(function(stream) {
	stream.on('data', function(c) {

		let requests = c.toString().trim();

		for( let request of requests.split(/\n\n/) ){
			request = request.split(/\n/);

			console.log(`Got request for request for ${request[0]} -> ${request[1]}`)

			worker( request[0], request[1], worker );

		}

	});

});
listener.listen( params.socket );


let cleanup = function( reason ){
	return ( code ) => {
		console.log(`Exiting ${code} [${reason}]`)
		listener.close();
		process.exit();

	}
}
process.on('SIGTERM', cleanup('SIGTERM'));
process.on('SIGINT', cleanup('SIGINT'));
process.on('exit', cleanup('exit'));



console.log('Listening');



function help(){
	console.log(`
			Usage:
			$ node index.js [limit] [socket] [delay]

				 - limit     amount of simultaneous downloads, defaults to 4

				 - socket    path to UNIX socket to open, defaults to sds.sock

				 - delay     the delay in microseconds before the new download 
				            is added to download queue, defaults to 500

			Running without args is equivalent to running as:
			$ node index.js 4 sds.sock 500
		`.replace(/^\t+/gm, "")
	);
}
