// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
const debug = require('./debug')('update-index');

const path = require('path');
const util = require('util');
const fs = require('fs');
const appendFile = util.promisify(fs.appendFile);
const readFile = util.promisify(fs.readFile);
const exists = util.promisify(fs.exists);

/**
 *
 * @param {String} dir The directory in which index.ts is to be updated/created
 * @param {*} file The new file to be exported from index.ts
 */
module.exports = async function(dir, file) {
  debug(`Updating index with ${path.join(dir, file)}`);
  const indexFile = path.join(dir, 'index.ts');
  if (!file.endsWith('.ts')) {
    throw new Error(`${file} must be a TypeScript (.ts) file`);
  }

  let index = '';
  const indexExists = await exists(indexFile);
  if (indexExists) {
    index = await readFile(indexFile);
  }
  const content = `export * from './${file.slice(0, -3)}';\n`;
  if (!index.includes(content)) {
    await appendFile(indexFile, content);
  }
};
