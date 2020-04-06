#!/usr/bin/env node
// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
================================================================================
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
      "program": "${workspaceRoot}/bin/mocha-current-file",
      "runtimeArgs": ["-r", "${workspaceRoot}/packages/build/node_modules/source-map-support/register"],
      "cwd": "${workspaceRoot}",
      "autoAttachChildProcesses": true,
      "args": [
        "--config",
        "${workspaceRoot}/packages/build/config/.mocharc.json",
        "-t",
        "0",
        "${file}"
      ],
      "disableOptimisticBPs": true
    }
  ]
}
```
================================================================================
*/

'use strict';
const path = require('path');
const fs = require('fs');

function findDistFile(filename) {
  const absolutePath = path.resolve(filename);
  const systemRoot = path.parse(absolutePath).root;
  let currentDir = path.dirname(absolutePath);

  let isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  while (!isPackageRoot) {
    if (path.dirname(currentDir) === systemRoot) {
      throw new Error(
        `Could not find a package.json file in the path heirarchy of ${absolutePath}`,
      );
    }
    currentDir = path.join(currentDir, '..');
    isPackageRoot = fs.existsSync(path.resolve(currentDir, 'package.json'));
  }
  const base = path.resolve(currentDir);
  const relative = path.relative(currentDir, absolutePath);
  const resultPath = relative.replace(/^src/, 'dist').replace(/\.ts$/, '.js');
  return path.resolve(base, resultPath);
}

const newFile = findDistFile(process.argv.splice(-1)[0]);

if (newFile) {
  require('../packages/build/node_modules/mocha/lib/cli').main(
    [...process.argv, newFile].slice(2),
  );
}
