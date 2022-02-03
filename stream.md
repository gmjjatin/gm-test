
In a new folder clone jsmpeg. `git clone https://github.com/phoboslab/jsmpeg.git` and cd into the folder.
```
npm i
sudo npm -g install http-server

run http-server .
```
In a different console, run  `node websocket-relay.js super 8081 8082`

In yet another console, run:

`
ffmpeg -i https://manifest.googlevideo.com/api/manifest/hls_playlist/expire/1633525062/ei/5khdYYrGKYvNz7sP4eOzGA/ip/137.97.111.217/id/UmclL6funN8.3/itag/95/source/yt_live_broadcast/requiressl/yes/ratebypass/yes/live/1/sgoap/gir%3Dyes%3Bitag%3D140/sgovp/gir%3Dyes%3Bitag%3D136/hls_chunk_host/rr2---sn-gwpa-jv36.googlevideo.com/playlist_duration/30/manifest_duration/30/vprv/1/playlist_type/DVR/initcwndbps/2430/mh/jY/mm/44/mn/sn-gwpa-jv36/ms/lva/mv/m/mvi/2/pl/19/dover/11/keepalive/yes/fexp/24001373,24007246/mt/1633503384/sparams/expire,ei,ip,id,itag,source,requiressl,ratebypass,live,sgoap,sgovp,playlist_duration,manifest_duration,vprv,playlist_type/sig/AOq0QJ8wRgIhAMVqpPCrDBriJ8YPZnFwytXpGFIuIrDWADqGDdpIpiOLAiEAx2jf01TjVa76kYRu_eUQWIqjxOGRvpki2ckChZEFRcg%3D/lsparams/hls_chunk_host,initcwndbps,mh,mm,mn,ms,mv,mvi,pl/lsig/AG3C_xAwRQIgSwhoMYPMuqxCFB7srmTb8KiKDRp7P8TfQ9vI-rqXek4CIQCf0AKCbG1o-AqlqCPuYEKB4OYTydVvVl7xnkLJQkQz3g%3D%3D/playlist/index.m3u8 -f mpegts -codec:v mpeg1video  -b:v 1000k -bf 0 http://localhost:8081/super
`

Now open your browser and go to: `http://localhost:8080/view-stream.html`