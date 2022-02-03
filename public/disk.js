var fs = require("fs");

var path = require('path');
const os = require('os');

const BYTES_PER_GB = 1024 ** 3;
const purgeOldFiles = (dir) => { 
  const files = fs.readdirSync(dir);
  let totalSize = 0;
  const fileMap = new Map();
  files.forEach(file => {
    const extension = path.extname(file);
    if(extension.match(/mp4|png/i)){
    
      const stats = fs.lstatSync(dir+file);
      let d = stats.birthtime.toISOString();
      fileMap.set(dir+file,d.substring(0,10));
      totalSize += stats.size;
    }
  });
  if(totalSize/BYTES_PER_GB > 250.0) { //delete files from the oldest day if size greater than 250 MB
    const mapSort1 =new Map([...fileMap.entries()].sort(([k1,v1],[k2,v2]) => v1.localeCompare(v2)));
    const expired = mapSort1.values().next().value;
    for (var [key, value] of mapSort1) {
      if(value == expired) {
        console.log(value + " removing " + key);
        fs.unlinkSync(key);
      }
    }
  }
  
}
//console.log("Loaded files",BYTES_PER_GB);

module.exports = {
  purgeOldFiles
};