// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');
const path = require('path');
const util = require('util');
const request = require('request-promise-native');

const writeFileAsync = util.promisify(fs.writeFile);

const DEST = path.resolve('generators/datasource/connectors.json');
const URL =
  'https://raw.githubusercontent.com/strongloop/loopback-workspace/master/available-connectors.json';

/**
 * Function to dowload the list of available connectors from loopback-workspace
 * so the list only has to be maintained in one place.
 */
async function download() {
  const data = await request(URL, {json: true});
  const out = {};

  /**
   * This transforms the array of Connector objects from
   * loopback-workspace as follows:
   *
   * - Transforms the array into an object / map
   * - Transforms display:password to type:password so it can be used by CLI directly
   * - Transforms description to message so it can be used by CLI directly
   */
  data.forEach(item => {
    if (item.settings) {
      Object.values(item.settings).forEach(value => {
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

  // Write data to file
  await writeFileAsync(DEST, JSON.stringify(out, null, 2));
}

download().catch(err => {
  console.error(err);
  process.exit(1);
});
