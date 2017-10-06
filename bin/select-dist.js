// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback-next
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
========

Usage:
  node ../../bin/select-dist command [arguments...]

The script will scan all arguments (including the command) and replace
the string DIST with either dist or dist6, depending on the current
Node.js version.

Then the provided command is executed with the modified arguments.

Example usage:

  node ../../bin/select-dist mocha DIST/test

========
*/

'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const nodeMajorVersion = +process.versions.node.split('.')[0];
const dist =  nodeMajorVersion >= 7 ? 'dist' : 'dist6';

const args = process.argv.slice(2).map(a => a.replace(/\bDIST\b/g, dist));
const command = args.shift();

console.log(command, args.join(' '));

spawn(
  command,
  // wrap all arguments in double-quotes to prevent Unix shell from
  // incorrectly resolving '**' as '*'
  args.map(a => JSON.stringify(a)),
  {
    stdio: 'inherit',
    // On Windows, npm creates `.cmd` files instead of symlinks in
    // `node_modules/.bin` folder. These files cannot be executed directly,
    // only via a shell.
    shell: true,
  }
).on('close', (number, signal) => (process.exitCode = number));
