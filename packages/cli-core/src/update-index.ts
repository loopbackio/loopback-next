// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import fs from 'fs';
import path from 'path';
import {promisify} from 'util';
import {debug as _debug} from './debug';
const debug = _debug('update-index');

const appendFile = promisify(fs.appendFile);
const readFile = promisify(fs.readFile);
const exists = promisify(fs.exists);

/**
 *
 * @param {String} dir The directory in which index.ts is to be updated/created
 * @param {*} file The new file to be exported from index.ts
 */
export async function updateIndex(dir: string, file: string) {
  debug(`Updating index with ${path.join(dir, file)}`);
  const indexFile = path.join(dir, 'index.ts');
  if (!file.endsWith('.ts')) {
    throw new Error(`${file} must be a TypeScript (.ts) file`);
  }

  let index = '';
  const indexExists = await exists(indexFile);
  if (indexExists) {
    index = await readFile(indexFile, 'utf-8');
  }
  const content = `export * from './${file.slice(0, -3)}';\n`;
  if (!index.includes(content)) {
    await appendFile(indexFile, content);
  }
}
