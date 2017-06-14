// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ../../bin/compile-package <target>

Where <target> is either es2017 or es2015.

Under the hood, we change the current directory to loopback-next root
and call tsc with project configuration from the original package's
tsconfig.build.json. This way tsc error messages contain a path
that's relative to loopback-next project root.

TODO(bajtos) Detect whether "npm run build" was triggered by lerna
or manually. When triggered manually from the package directory,
then we should not change the directory.

========
*/

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const rootDir = path.resolve(__dirname, '..');
const packageDir = path.relative(rootDir, process.cwd());

const compilerOpts = process.argv.slice(2);
const target = compilerOpts.shift();

let outDir;
switch (target) {
  case 'es2017':
    outDir = 'lib';
    break;
  case 'es2015':
    outDir = 'lib6';
    break;
  default:
    console.error('Unknown build target %s. Supported values: es2015, es2017');
    process.exit(1);
}

process.chdir(rootDir);

const args = [
  require.resolve('typescript/lib/tsc'), // see typescript/bin/tsc
  '-p',
  // It's important to keep this path relative to rootDir
  path.join(packageDir, 'tsconfig.build.json'),
  '--target',
  target,
  '--outDir',
  path.join(packageDir, outDir),
  ...compilerOpts,
];

console.log('loopback-next$ tsc', args.slice(1).join(' '));

spawn(
  process.execPath, // Typically '/usr/local/bin/node'
  args,
  {
    stdio: 'inherit',
  }
).on('close', (number, signal) => (process.exitCode = number));
