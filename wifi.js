var wifi = require('node-wifi');
const execFile = require('child_process').execFile;

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
  iface: 'wlan0' // network interface, choose a random wifi interface if set to null
});

// Scan networks

function getSSIDs()
{
  return wifi.scan((error, networks) => {
    if (error) {
      console.log(error);
      return null;
    } else {
      console.log(networks);
      return networks;

    }
  });
}



function connect(ssid,pwd){
  // Connect to a network
  const args = [];
  args.push('device');
  args.push('wifi');
  args.push('connect');
  args.push(ssid);
  args.push('password');
  args.push(pwd);

  // if (config.iface) {
  //   args.push('ifname');
  //   args.push(config.iface);
  // }

  let connectme = ({ ssid: ssid, password: pwd }, error => {
    if (error) {
      console.log(error);
      return false;
    }
    console.log('Connected');
    return true;
  });
  execFile('nmcli', args,(err, resp) => {
    // Errors from nmcli came from stdout, we test presence of 'Error: ' string
    if (resp.includes('Error: ')) {
      err = new Error(resp.replace('Error: ', ''));
    }
    connectme && connectme(err);
  });

}
function disconnect() {
  // Disconnect from a network
// not available on all os for now
wifi.disconnect(error => {
  if (error) {
    console.log(error);
  } else {
    console.log('Disconnected');
  }
});
}


//SAMPLE CALLS


(async() => {
   await getSSIDs()  
 })()

// (async() => {
//   await connect('ssid','pwd')  
// })()

// (async() => {
//   await disconnect();  
// })()