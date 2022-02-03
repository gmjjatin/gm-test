var wifi = require('node-wifi');
const execFile = require('child_process').execFile;

// Initialize wifi module
// Absolutely necessary even to set interface to null
wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});


 function scan(event) {
wifi.scan((error, networks) => {
    if (error) {
      console.log(error);

      event.reply('get_ssids', 'error');
      return null;
    } else {
     // console.log(networks);
     wifi.init({
        iface: networks[0].iface // network interface, choose a random wifi interface if set to null
    });
      event.reply('get_ssids', networks);
      return networks;

    }
  });
}

 function connect_ssid(event, ssid, pwd) {
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
      event.reply('connect_ssid', false);
    } else {
      console.log('Connected');
      isConnected(event);
      event.reply('connect_ssid', true);
    }
  });
  execFile('nmcli', args,(err, resp) => {
    // Errors from nmcli came from stdout, we test presence of 'Error: ' string
    if (resp.includes('Error: ')) {
      err = new Error(resp.replace('Error: ', ''));
    }
    connectme && connectme(err);
  });
}

function disconnect(event) {
     // Disconnect from a network
  // not available on all os for now
  wifi.disconnect(error => {
    if (error) {
      console.log(error);
      event.reply('disconnect_ssid', false);
    } else {
      console.log('Disconnected');
      event.reply('disconnect_ssid', true);
    }
  });
}

function isConnected(event) {
// List the current wifi connections
    wifi.getCurrentConnections((error, currentConnections) => {
        if (error) {
        console.log(error);
        } else {
        //console.log(currentConnections);
        if(currentConnections.length > 0){
            event.reply('isWifiConnected', currentConnections[0].ssid);
            wifi.init({
                iface: currentConnections[0].iface // network interface, choose a random wifi interface if set to null
            });
        } else
            event.reply('isWifiConnected', []);
        return true;
        }
        event.reply('isWifiConnected', []);
        return false;
    });
}

module.exports = {scan,disconnect,connect_ssid,isConnected};