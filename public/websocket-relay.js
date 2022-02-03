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

var streamer = function(streamUrl, streamPath) {
	mpeg1Muxer = new Mpeg1Muxer({
		ffmpegOptions: { // options ffmpeg flags
			// '-stats': '', // an option with no neccessary value uses a blank string
			// '-r': 30 // options with required values specify the value after the key
		  },
		url: streamUrl,
		ffmpegPath: "ffmpeg",
		streamPath,
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

// streamer("http://34.134.95.163/cgi-bin/stream","./streams");
// setTimeout(function() {stopStream()},  15000);
var stopStream = function() {
	mpeg1Muxer.stopStream();
	// socketServer.close();
}

var renameVideo = function(serialNumber, userId) {
	mpeg1Muxer.renameVideo(serialNumber, userId);
	// socketServer.close();
}

module.exports = { streamer, stopStream,renameVideo };
//console.log('Awaiting WebSocket connections on ws://127.0.0.1:'+WEBSOCKET_PORT+'/');
