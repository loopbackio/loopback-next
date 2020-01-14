#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========
This is used in the launch.json to enable you to debug a test file written in
typescript.  This function attempts to convert the passed typescript file to
the best-guess output javascript file.

It walks up the filesystem from the current file, stops at package.json, and
looks in `dist`

Ideally, we could somehow use the typescript compiler and tsconfig.json to get
the explicit output file instead of trying to guess it, but there might be
overhead.

Ex:
```jsonc
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Test File",
      "program": "${workspaceRoot}/packages/build/node_modules/.bin/_mocha",
      "cwd": "${workspaceRoot}",
      "autoAttachChildProcesses": true,
      "args": [
        "--config",
        "${workspaceRoot}/packages/build/config/.mocharc.json",
        "-t",
        "0",
        "$(node ${workspaceRoot}/packages/build/bin/get-dist-file ${file})"
      ],
      "disableOptimisticBPs": true
    }
  ]
}
```

For your personal projects, you can invoke directly from @loopback/build:
```
"$(node ${workspaceRoot}/node_modules/@loopback/build/bin/get-dist-file ${file})"
```
You still have to compile the package/project first.
========
*/

'use strict';
const path = require('path');
const fs = require('fs');

function findDistFile(filename) {
  const absolutePath = path.resolve(filename);
  let currentDir = path.dirname(absolutePath);
  let isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  while (!isPackageRoot) {
    currentDir = path.join(currentDir, '..');
    isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  }
  const base = path.resolve(currentDir);
  const relative = path.relative(currentDir, absolutePath);
  const resultPath = relative
    .replace(/^src\//, 'dist/')
    .replace(/\.ts$/, '.js');
  return path.resolve(base, resultPath);
}

module.exports = findDistFile;
if (require.main === module) {
  process.stdout.write(findDistFile(process.argv.splice(-1)[0]));
}
