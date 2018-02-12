#!/usr/bin/env node
// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const build = require('../packages/build');
const debug = require('debug')('build-watch');
const chokidar = require('chokidar');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const MONOREPO_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.resolve(MONOREPO_DIR, '.build');

mkdirp.sync(BUILD_DIR);

chokidar
  .watch(BUILD_DIR, {
    persistent: true,
    cwd: BUILD_DIR,
    awaitWriteFinish: true,
  })
  .on('add', path => copyFile(path, onError))
  .on('change', path => copyFile(path, onError))
  .on('unlink', path => removeFile(path, onError));

const tscChild = build.tsc([
  // disable emitting of `.d.ts` files to speed up compilation times
  '--declaration',
  'false',
  // skip checking types in imported libraries (another speedup)
  '--skipLibCheck',

  // use the main monorepo-wide tsconfig
  '--project',
  path.resolve(__dirname, '..', 'tsconfig.json'),
  // store the compiled output in a special directory we are watching
  '--outDir',
  BUILD_DIR,

  // and finally, enable the watch mode
  '--watch',
]);

process.on('uncaughtException', onError);

function copyFile(filePath, callback) {
  debug('<update> %j', filePath);
  const parts = filePath.split(/[\/\\]/g);
  const pkg = parts.shift();
  const localPath = parts.join('/');

  const target = path.join(MONOREPO_DIR, 'packages', pkg, 'dist', localPath);

  mkdirp(path.dirname(target), err => {
    if (err) return callback(err);

    fs.copyFile(path.join(BUILD_DIR, filePath), target, callback);
  });
}

function removeFile(filePath, callback) {
  debug('<remove> %j', filePath);
  fs.unlink(filePath, callback);
}

function onError(err) {
  if (!err) return;

  tscChild.kill();
  console.error('Unhandled error', err);
  process.exit(1);
}
