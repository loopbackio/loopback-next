// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('./debug')('update-index');

const path = require('path');
const fse = require('fs-extra');
const defaultFs = {
  read: fse.readFile,
  write: fse.writeFile,
  append: fse.appendFile,
  exists: fse.exists,
};

/**
 *
 * @param {String} dir The directory in which index.ts is to be updated/created
 * @param {*} file The new file to be exported from index.ts
 */
module.exports = async function (dir, file, fsApis) {
  const {read, write, append, exists} = {...defaultFs, ...fsApis};
  debug(`Updating index with ${path.join(dir, file)}`);
  const indexFile = path.join(dir, 'index.ts');
  if (!file.endsWith('.ts')) {
    throw new Error(`${file} must be a TypeScript (.ts) file`);
  }

  let index = '';
  const indexExists = await exists(indexFile);
  if (indexExists) {
    index = await read(indexFile);
  }
  const content = `export * from './${file.slice(0, -3)}';\n`;
  if (!index.includes(content)) {
    if (indexExists) {
      await append(indexFile, content);
    } else {
      await fse.ensureDir(dir);
      await write(indexFile, content);
    }
  }
};
