const meshblu = require('meshblu');
const argv = require('yargs')
.command({
  command: 'config <thing_uuid> <sensor_id>',
  desc: 'Updates the <sensor_id> configuration in <thing_uuid>',
  builder: (yargs) =>
    yargs
    .option('event-flags', {
        alias: 'f',
        describe: 'KNoT event flags, for more information consult knotd documentation',
        choices: Array.from(Array(15).keys(), (x,i) => i+1),
        default: 8
    })
    .options('time', {
        alias: 'T',
        describe: 'time in seconds to to send a data',
        default: 0
    })
    .option('lower-limit', {
        alias: 'l',
        describe: 'lower limit to send a value',
        default: 0
    })
    .option('upper-limit', {
        alias: 'L',
        describe: 'upper limit to send a value',
        default: 0
    }),
  handler: (argv) => {
    const conn = meshblu.createConnection({
      server: argv.server,
      port: argv.port,
      uuid: argv.uuid,
      token: argv.token,
    });

    conn.on('ready', () => {
      console.log(`Sending config from sensor ${argv.sensor_id} on thing ${argv.thing_uuid}`);
      conn.update({
          "uuid": argv.thing_uuid,
          "config":[{
            "sensor_id": argv.sensor_id,
            "event_flags": argv.eventFlags,
            "time_sec": argv.timeSec,
            "lower_limit": argv.lowerLimit,
            "upper_limit": argv.upperLimit
            }]
      }, (result) => {
        console.log('update config: ');
        console.log("Name: " + JSON.stringify(result.name, null, 2));
        console.log("Type: " + JSON.stringify(result.type, null, 2));
        console.log("UUID: " + JSON.stringify(result.uuid, null, 2));
        console.log("Online: " + JSON.stringify(result.online, null, 2));
        console.log("Config: " + JSON.stringify(result.config, null, 2));
        console.log();
      });
    });

    conn.on('notReady', () => {
      console.log('Connection not authorized');
    });
  }
});