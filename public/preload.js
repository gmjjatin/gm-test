const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            console.log(channel, data);
            ipcRenderer.send(channel, data);
        },
        on: (channel, func) => {
                // Deliberately strip event as it includes `sender` 
            ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
        }
    }
);