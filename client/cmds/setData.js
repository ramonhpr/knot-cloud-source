const meshblu = require('meshblu');
const argv = require('yargs')
.command({
    command: 'set data <thing_uuid> <sensor_id> <sensor_value>',
    desc: 'Sets the value in the specified id from the thing with the specified uuid',
    handler: (argv) => {
        var conn = meshblu.createConnection({
            server: argv.server,
            port: argv.port,
            uuid: argv.uuid, // owner uuid
            token: argv.token,// owner token
        })

        conn.on('ready', function () {
            console.log('Setting data on item of THING');
            /*
            * Sets the value in the specified id from the thing with the specified
            * uuid.
            */
            conn.update({
                    "uuid": argv.thing_uuid, //thing UUID
                    "set_data": [{
                        "sensor_id":argv.sensor_id,
                        "value": !isNaN(argv.sensor_value) ? parseFloat(argv.sensor_value): ((argv.sensor_value == 'true') || false)
                }]
            }, function (result) {
                console.log('Verify the data using ReadData');
                console.log("name: " + JSON.stringify(result.name, null, 2));
                console.log("type: " + JSON.stringify(result.type, null, 2));
                console.log("uuid: " + JSON.stringify(result.uuid, null, 2));
                console.log("online: " + JSON.stringify(result.online, null, 2));
                console.log("ID: " + JSON.stringify(result.set_data[0].sensor_id, null, 2));
                console.log();
            });
        });

        conn.on('notReady', function () {
            console.log('Connection not authorized');
        });
    }
});
