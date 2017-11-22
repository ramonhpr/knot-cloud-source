http = require ('http')
const argv = require('yargs')
.command({
  command: 'data <thing_uuid>',
  desc: 'Returns data from cloud',
  handler: (argv) => {
    let options = {
      host: argv.server,
      port: argv.port,
      path: '/data/' + argv.thing_uuid,
      headers: {
          'meshblu_auth_uuid': argv.uuid,
          'meshblu_auth_token': argv.token,
          'Content-Type':'application/json'
      }
    };
    http.get(options, (res) => {
      const statusCode = res.statusCode;
      const contentType = res.headers['content-type'];
      let error;
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\n` +
                `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\n` +
                  `Expected application/json but received ${contentType}`);
      }
      if (error) {
        console.log(error.message);
        res.resume();
        return;
      }
      res.setEncoding('utf8');
      rawData = '';
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        try {
          parsedData = JSON.parse(rawData);
          console.log(parsedData.data);
        } catch (e) {
          console.log(e.message);
        }
      }).on('error', (e) => {
        console.log(`Got error: ${e.message}`);
      });
    });
  }
});
