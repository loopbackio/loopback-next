// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const fs = require('fs');
const path = require('path');
const glob = require('glob');

function mapFile(cwd, file) {
  const dir = path.dirname(file);
  const name = path.basename(file);
  return {
    path: dir,
    file: name,
    content: fs.readFileSync(path.join(cwd, file), {
      encoding: 'utf-8',
    }),
  };
}

module.exports = function discoverFiles(cwd) {
  return glob
    .sync('**/*.{js,ts,json}', {nodir: true, cwd})
    .filter(f => f !== 'index.js')
    .map(f => mapFile(cwd, f));
};
