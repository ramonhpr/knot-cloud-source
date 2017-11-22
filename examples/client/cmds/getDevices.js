const meshblu = require('meshblu');
const argv = require('yargs')
.command({
  command: 'devices',
  desc: 'Returns the devices from all gateways',
  handler: (argv) => {
    const conn = meshblu.createConnection({
      server: argv.server,
      port: argv.port,
      uuid: argv.uuid,
      token: argv.token,
    });

    conn.on('ready', (result) => {
      console.log('Getting devices from gateways');
      conn.devices({
        gateways: ["*"]
      }, (result) => {
        if (result.error) {
          console.log(result);
        } else {
          for (let i = 0; i < result.length; i++) {
              console.log("Device: ",i);
              console.log("Name: " + JSON.stringify(result[i].name, null, 2));
              console.log("Type: " + JSON.stringify(result[i].type, null, 2));
              console.log("UUID: " + JSON.stringify(result[i].uuid, null, 2));
              console.log("Online: " + JSON.stringify(result[i].online, null, 2));
              console.log();
          }
        }
      });
    });

    conn.on('notReady', () => {
      console.log('Connection not authorized');
    });
  }
});
