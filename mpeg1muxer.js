var Mpeg1Muxer, child_process, events, util

child_process = require('child_process')

util = require('util')

events = require('events')
var fs = require("fs")
var kill  = require('tree-kill');
Mpeg1Muxer = function(options) {
  var fileStream = fs.createWriteStream('./stream.mp4', {flags: 'w'});
  var self = this;
  var key
  this.url = options.url
  this.ffmpegOptions = options.ffmpegOptions
  this.exitCode = undefined
  this.additionalFlags = []
  if (this.ffmpegOptions) {
    for (key in this.ffmpegOptions) {
      this.additionalFlags.push(key)
      if (String(this.ffmpegOptions[key]) !== '') {
        this.additionalFlags.push(String(this.ffmpegOptions[key]))
      }
    }
  }
  this.spawnOptions = [ //flogFile.logfmpeg -i all.ts -acodec copy -vcodec copy all.mp4
    "-re",
    "-i",
    this.url,
    "-filter_complex",
    "zmq,eq@my=contrast=1:brightness=0,hue@my=h=0,rotate@my=a=0",
    "-bf",
    "0",
    "-c:v",
    "mpeg1video",
    "-f",
     "mpegts",

    // additional ffmpeg options go here
    ...this.additionalFlags,
    '-'
  ]
  this.stream = child_process.spawn(options.ffmpegPath, this.spawnOptions, {
    detached: false
  })
  this.inputStreamStarted = true
  this.stream.stdout.pipe(fileStream);

  this.stream.stdout.on('data', (data) => {
    return self.emit('mpeg1data', data)
  })
  this.stream.stderr.on('data', (data) => {
    return self.emit('ffmpegStderr', data)
  })
  this.stream.on('exit', (code, signal) => {
    fileStream.end();
    if (code === 1) {
      console.error('RTSP stream exited with error')
      this.exitCode = 1
      return self.emit('exitWithError')
    }
  })
  return this
}
Mpeg1Muxer.prototype.stopStream = function() {
  kill(this.stream.pid);
};


util.inherits(Mpeg1Muxer, events.EventEmitter)


module.exports = Mpeg1Muxer
