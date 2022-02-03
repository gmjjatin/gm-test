var Mpeg1Muxer, child_process, events, util

child_process = require('child_process')
util = require('util')
events = require('events')
const { Login } = require('@mui/icons-material');
var fs = require("fs");
var kill  = require('tree-kill');
Mpeg1Muxer = function(options) {

  var self = this;
  var key
 this.filepath = options.streamPath;
  console.log( this.filepath);
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
  /*

    "-s",
    "1920x1080",
  */
  this.spawnOptions = [ //flogFile.logfmpeg -i all.ts -acodec copy -vcodec copy all.mp4

    "-thread_queue_size",
    "0",
    "-i",
    this.url,
    "-filter_complex",
    "zmq,eq@my=contrast=1:brightness=0,hue@my=h=0,rotate@my=a=0",
    "-bf",
    "0",
    "-b:v",
    " 2500k",
    "-r",
    "30",
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
  this.ff = child_process.spawn("ffmpeg", ["-i", "-", "-filter:v", "setpts=2.0*PTS","-c:v", "libx264", this.filepath +".mp4"]);//split('/').slice(-1)[0] 
this.stream.stdout.pipe(this.ff.stdin);

  this.stream.stdout.on('data', (data) => {
    return self.emit('mpeg1data', data)
  })
  this.stream.stderr.on('data', (data) => {
    return self.emit('ffmpegStderr', data)
  })
  this.stream.on('exit', (code, signal) => {
    if (code === 1) {
      console.error('RTSP stream exited with error')
      this.exitCode = 1
      return self.emit('exitWithError')
    }
  })
  return this;
}
Mpeg1Muxer.prototype.stopStream = function() {
  //ff.stdin.pause();
 // kill(this.ff.pid)
  kill(this.stream.pid);
    
};
Mpeg1Muxer.prototype.renameVideo = function(serialNumber, userId) {
  const renameTo = (this.filepath +".mp4").replace("uid-", userId+'-').replace("ser-",serialNumber+'-');
  //console.log("renameTo", renameTo);
  try {
    fs.renameSync(this.filepath+".mp4", renameTo);
  } catch(e) {

  }
}

util.inherits(Mpeg1Muxer, events.EventEmitter)


module.exports = Mpeg1Muxer
