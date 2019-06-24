// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as fs from 'fs';
import {promisify} from 'util';
const readdirAsync = promisify(fs.readdir);

export async function main() {
  let files = await readdirAsync(__dirname);

  // Sort the files by name for consistency
  files = files.filter(f => f.endsWith('.js') && f !== 'index.js').sort();
  for (const name of files) {
    console.log('> %s', name);
    const example = require(`./${name}`);
    try {
      await example.main();
    } catch (err) {
      console.error(err);
    }
    console.log('');
  }
}

if (require.main === module) {
  process.env.FOO = JSON.stringify({bar: 'xyz'});

  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
