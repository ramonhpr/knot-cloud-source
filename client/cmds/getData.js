const meshblu = require('meshblu');
const argv = require('yargs')
.command({
    command: 'get data <thing_uuid> <sensor_id>',
    desc: 'Gets the value in the specified id from the thing with the specified',
    handler: (argv) => {
        var conn = meshblu.createConnection({
            server: argv.server,
            port: argv.port,
            uuid: argv.uuid,  // owner uuid
            token: argv.token,// owner token
        });
        
        conn.on('ready', function () {
            console.log('Getting data from item on THING');
            /*
             * Gets the value in the specified id from the thing with the specified
             */
            conn.update({
                    "uuid": argv.thing_uuid, //thing UUID
                    "get_data": [{
                        "sensor_id":argv.sensor_id
                   }]
            }, function (result) {
                console.log('Verify the data using ReadData');
                console.log("name: " + JSON.stringify(result.name, null, 2));
                console.log("type: " + JSON.stringify(result.type, null, 2));
                console.log("uuid: " + JSON.stringify(result.uuid, null, 2));
                console.log("online: " + JSON.stringify(result.online, null, 2));
                console.log("ID: " + JSON.stringify(result.get_data[0].sensor_id, null, 2));
                console.log();
            });
        });
        
        conn.on('notReady', function () {
            console.log('Connection not authorized');
        });
    }
});
