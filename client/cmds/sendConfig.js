const meshblu = require('meshblu');
const argv = require('yargs')
.command({
    command: 'config <thing_uuid> <sensor_id>',
    desc: 'Updates the config in the thing with the uuid specified',
    handler: (argv) => {
        var conn = meshblu.createConnection({
            server: argv.server,
            port: argv.port,
            uuid: argv.uuid,  // owner uuid
            token: argv.token,// owner token
        });

        conn.on('ready', function () {
            console.log('Sending config for item on THING');
            /*
            * Updates the config in the thing with the uuid specified.
            */
            conn.update({
                    "uuid": argv.thing_uuid, //thing UUID
                    "config":[{
                        "sensor_id": argv.sensor_id,
                        "event_flags": argv.eventFlags,
                        "time_sec": argv.timeSec,
                        "lower_limit": argv.lowerLimit,
                        "upper_limit": argv.upperLimit
                        }]
            }, function (result) {
                console.log('update config: ');
                console.log("name: " + JSON.stringify(result.name, null, 2));
                console.log("type: " + JSON.stringify(result.type, null, 2));
                console.log("uuid: " + JSON.stringify(result.uuid, null, 2));
                console.log("online: " + JSON.stringify(result.online, null, 2));
                console.log("config: " + JSON.stringify(result.config, null, 2));
                console.log();
            });
        });

        conn.on('notReady', function () {
            console.log('Connection not authorized');
        });
    }
});