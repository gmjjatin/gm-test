const path = require('path');
const os = require('os');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const videoControl = require('./videoControls');
const { spawn } = require('child_process');
const fs = require('fs');
const websocket = require('./websocket-relay');
const drivelist = require('drivelist');
const wifi = require('./wifi');
const db = require('./db');
const disk = require('./disk');
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname+ '/grumpy_innovation_logo.jpg',
    webPreferences: {
      nodeIntegration: true,
      autoHideMenuBar: true,
      // worldSafeExecuteJavaScript: true,
      // contextIsolation: true,
      //enableRemoteModule: false,
      //preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.removeMenu();
  win.maximize();

  // and load the index.html of the app.
  // win.loadFile("index.html");\
  win.loadURL(
    isDev
      ? `file://${path.join(__dirname, '../build/index.html')}`
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
  // Open the DevTools.
  // if (isDev) {
 //   win.webContents.openDevTools({ mode: 'detach' });
  // }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

/**
 * SSID Funtions
 */ 

ipcMain.on('isWifiConnected', (event, data) => {
  return wifi.isConnected(event);
});

ipcMain.on('get_ssids', (event, data) => {
  return wifi.scan(event);
});


ipcMain.on('connect_ssid', (event, data) => {
  const { ssid, pwd } = data;
  wifi.connect_ssid(event,ssid, pwd);
});


ipcMain.on('disconnect_ssid', (event, data) => {
  wifi.disconnect(event);
});

ipcMain.on('fetch_saved_ssid_pwd', (event, data) => {
  const { ssid } = data;
  let ret = db.fetchSSID(event,ssid);
});

ipcMain.on('save_ssid_pwd', (event, data) => {
  const { ssid, pwd } = data;
  return db.saveSSID(ssid,pwd);
});

ipcMain.on('download_screenshot', (event, data) => {
  const { currentFrameData,serialNumber,userId,path } = data;
  var base64Data = currentFrameData.replace(/^data:image\/png;base64,/, "");
  let timestamp = new Date().toISOString().split('.')[0];
  timestamp = timestamp.replaceAll(/-|:|T/g, '');
  fs.writeFile(`${path}${userId}-${serialNumber}-${timestamp}.png`, base64Data, 'base64', function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log('Screeshot Taken');
    }
  });
});

//  Export Files
ipcMain.on('export_files', (event, data) => {
  const { src, fileName } = data;
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
    console.log(result);
    fs.copyFile(src + fileName, result + '/' + fileName, (err) => {
      if (err) {
        console.log(err);
        event.reply('export_files', false);
      } else {
        console.log('Exported');
        event.reply('export_files', true);
      }
    });
 });
});

ipcMain.on('start_streaming', (event, data) => {
  const { streamUrl, streamPath } = data;
  websocket.streamer(streamUrl, streamPath);
});

ipcMain.on('stop_streaming', (event, data) => {
  console.log("stopping now...")
  websocket.stopStream();
});

ipcMain.on('change_brightness', (event, data) => {
  const { brightness } = data;
  videoControl.controlBrightness(brightness);
});

ipcMain.on('change_contrast', (event, data) => {
  const { contrast } = data;
  videoControl.controlContrast(contrast);
});

ipcMain.on('change_color_balance', (event, data) => {
  let { colorBalance } = data;
  videoControl.controlBalance(colorBalance);
});

ipcMain.on('rotate', (event, data) => {
  const { angle } = data;
  videoControl.rotate(angle);
});

ipcMain.on('get_media_path', (event, data) => {
  let dir = path.join(os.homedir(), 'grumpyapp',"media/");
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
  } else { //disk management
    disk.purgeOldFiles(dir);
  }
  event.reply("get_media_path",dir);
});


// when <Media/> mounts , it asks for media file
ipcMain.on('load-media-files', (event,data) => {
  //console.log("Loaded files",data);
  const {dirName, serialNumber, userId} = data;
  const files = fs.readdirSync(dirName);
  //console.log("Loaded files",files);
  let fileRows = [];
  files.forEach(file => {
    const extension = path.extname(file);
    if(extension.match(/mp4|png/i)){
      const temp = {};
      temp.id = dirName+file;
      temp.fileName = file;
      fileRows.push(temp);
    }
  });
  event.reply('load-media-files', fileRows);
  websocket.renameVideo(serialNumber, userId);

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();

  }
});



