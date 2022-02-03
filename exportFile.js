const drivelist = require('drivelist');

async function getExportPath() {
    let mountPath = null;
    mountPath = await drivelist.list().then( (drives) => {
         drives.forEach((drive) => {
        // console.log(drive);
            if (drive.isUSB) {
            // console.log(drive)
            try {
                mountPath = drive.mountpoints[0].path;
                //console.log(mountPath); 
            } catch(e) {
            }
            }
        });
        return mountPath;
    });
    return mountPath;
}


getExportPath().then(function(result) {
    console.log(result)
 });