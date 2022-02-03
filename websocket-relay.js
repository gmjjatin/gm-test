// Use the websocket-relay to serve a raw MPEG-TS over WebSockets. You can use
// ffmpeg to feed the relay. ffmpeg -> websocket-relay -> browser
// Example:
// node websocket-relay yoursecret 8081 8082
// ffmpeg -i <some input> -f mpegts http://localhost:8081/yoursecret

var fs = require('fs'),
	http = require('http'),
	WebSocket = require('ws'),
	events = require('events'),
	util = require('util'),
Mpeg1Muxer = require('./mpeg1muxer')
require('./controls')
// if (process.argv.length < 3) {
// 	console.log(
// 		'Usage: \n' +
// 		'node websocket-relay.js <secret> [<stream-port> <websocket-port>]'
// 	);
// 	process.exit();
// }

var STREAM_SECRET = process.argv[2],
	STREAM_PORT = process.argv[3] || 8081,
	WEBSOCKET_PORT = process.argv[4] || 8082,
	RECORD_STREAM = false;

// Websocket Server
var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT, perMessageDeflate: false});
socketServer.connectionCount = 0;
socketServer.on('connection', function(socket, upgradeReq) {
	socketServer.connectionCount++;
	console.log(
		'New WebSocket Connection: ',
		(upgradeReq || socket.upgradeReq).socket.remoteAddress,
		(upgradeReq || socket.upgradeReq).headers['user-agent'],
		'('+socketServer.connectionCount+' total)'
	);
	socket.on('close', function(code, message){
		socketServer.connectionCount--;
		console.log(
			'Disconnected WebSocket ('+socketServer.connectionCount+' total)'
		);
	});
});
socketServer.broadcast = function(data) {
	socketServer.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
};
let mpeg1Muxer = null;
var streamer = function() {
	mpeg1Muxer = new Mpeg1Muxer({
		ffmpegOptions: { // options ffmpeg flags
			// '-stats': '', // an option with no neccessary value uses a blank string
			// '-r': 30 // options with required values specify the value after the key
		  },
		url: "http://10.3.141.1/cgi-bin/stream",
		ffmpegPath: "ffmpeg"
	  })
	  stream = mpeg1Muxer.stream
	  if (this.inputStreamStarted) {
		return
	  }
	  mpeg1Muxer.on('mpeg1data', (data) => {
		socketServer.broadcast(data);
	  })
	  mpeg1Muxer.on('ffmpegStderr', function(data) {
		return global.process.stderr.write(data)
	  })
	  mpeg1Muxer.on('exitWithError', () => {
		console.log("error");
	  })
}
util.inherits(streamer, events.EventEmitter)
// HTTP Server to accept incomming MPEG-TS Stream from ffmpeg
// var streamServer = http.createServer( function(request, response) {
// 	var params = request.url.substr(1).split('/');

// 	if (params[0] !== STREAM_SECRET) {
// 		console.log(
// 			'Failed Stream Connection: '+ request.socket.remoteAddress + ':' +
// 			request.socket.remotePort + ' - wrong secret.'
// 		);
// 		response.end();
// 	}

// 	response.connection.setTimeout(0);
// 	console.log(
// 		'Stream Connected: ' +
// 		request.socket.remoteAddress + ':' +
// 		request.socket.remotePort
// 	);
// 	request.on('data', function(data){
// 		socketServer.broadcast(data);
// 		if (request.socket.recording) {
// 			request.socket.recording.write(data);
// 		}
// 	});
// 	request.on('end',function(){
// 		console.log('close');
// 		if (request.socket.recording) {
// 			request.socket.recording.close();
// 		}
// 	});

// 	// Record the stream to a local file?
// 	if (RECORD_STREAM) {
// 		var path = 'recordings/' + Date.now() + '.ts';
// 		request.socket.recording = fs.createWriteStream(path);
// 	}
// })
// // Keep the socket open for streaming
// streamServer.headersTimeout = 0;
// streamServer.listen(STREAM_PORT);

//console.log('Listening for incomming MPEG-TS Stream on http://127.0.0.1:'+STREAM_PORT+'/<secret>');
streamer();

function stopStream() {
	mpeg1Muxer.stopStream();
	socketServer.close();
}

console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');


setTimeout(function() {stopStream()},  10000);