const meshblu = require('meshblu');
const argv = require('yargs')
.command({
    command: 'devices',
    desc: 'Returns all the devices (things) from the specified gateway',
    handler: (argv) => {
        var conn = meshblu.createConnection({
            server: argv.server,
            port: argv.port,
            uuid: argv.uuid,  // owner uuid
            token: argv.token,// owner token
        });
        
        conn.on('ready', function (result) {
            console.log('Getting devices from GW');
            /*
             * Returns all the devices (things) from the specified gateway. If "*" is
             * passed, returns the devices from all gateways.
             */
            conn.devices({
                gateways: ["*"] // Either a list of gw uuids or "*".
            }, function (result) {
            if (result.error)
                console.log(result);
            else 
                for (var i = 0; i < result.length; i++) {
                        console.log("Device: ",i);
                        console.log("name: " + JSON.stringify(result[i].name, null, 2));
                        console.log("type: " + JSON.stringify(result[i].type, null, 2));
                        console.log("uuid: " + JSON.stringify(result[i].uuid, null, 2));
                        console.log("online: " + JSON.stringify(result[i].online, null, 2));
                        console.log();
                }
            });
        });
        
        conn.on('notReady', function () {
            console.log('Connection not authorized');
        });
    }
});
