const https = require('https');
const fs = require('fs');
const path = require('path');
const util = require('util');

const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);

const DEST = path.resolve('generators/datasource/connectors.json');
const URL =
  'https://raw.githubusercontent.com/strongloop/loopback-workspace/master/available-connectors.json';

/**
 * Function to dowload the list of available connectors from loopback-workspace
 * so the list only has to be maintained in one place.
 */
async function download() {
  var file = fs.createWriteStream(DEST);
  var request = https
    .get(URL, function(response) {
      response.pipe(file);
      file.on('finish', async function() {
        file.close();
        await transformConnectorJSON();
      });
    })
    .on('error', function(err) {
      fs.unlink(DEST);
      return err;
    });
}

/**
 * This function transforms the array of Connector objects from
 * loopback-workspace as follows:
 *
 * - Transforms the array into an object / map
 * - Transforms display:password to type:password so it can be used by CLI directly
 * - Transforms description to message so it can be used by CLI directly
 */
async function transformConnectorJSON() {
  let data = await readFileAsync(DEST, 'utf-8');
  data = JSON.parse(data);
  const out = {};
  data.forEach(item => {
    if (item.settings) {
      Object.entries(item.settings).forEach(([key, value]) => {
        if (value.display === 'password') {
          value.type = 'password';
          delete value.display;
        }

        if (value.description) {
          value.message = value.description;
          delete value.description;
        }
      });
    }
    out[item.name] = item;
  });
  await writeFileAsync(DEST, JSON.stringify(out, null, 2));
}

download();
