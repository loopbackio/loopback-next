// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');
const util = require('util');
const fs = require('fs');
const appendFileAsync = util.promisify(fs.appendFile);

/**
 *
 * @param {String} dir The directory in which index.ts is to be updated/created
 * @param {*} file The new file to be exported from index.ts
 */
module.exports = async function(dir, file) {
  const indexFile = path.join(dir, 'index.ts');
  if (!file.endsWith('.ts')) {
    throw new Error(`${file} must be a TypeScript (.ts) file`);
  }
  const content = `export * from './${file.slice(0, -3)}';\n`;
  await appendFileAsync(indexFile, content);
};
