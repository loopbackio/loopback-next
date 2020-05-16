// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const path = require('path');

module.exports = {
  '*.{js,ts,md}': files => {
    const cwd = process.cwd();
    files = files.map(f => path.relative(cwd, f));
    const commands = [
      `node packages/build/bin/run-prettier --write ${files.join(' ')}`,
      `node packages/build/bin/run-eslint --report-unused-disable-directives` +
        ` --fix --cache ${files.join(' ')}`,
    ];
    return commands;
  },
};
