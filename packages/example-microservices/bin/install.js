#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;

const servicesRoot = path.resolve(__dirname, '..', 'services');
const services = fs.readdirSync(servicesRoot);

let p = Promise.resolve();
for (const s of services) {
  p = p.then(() => {
    return execNpmInstall(`services/${s}`);
  });
}

p.catch(err => {
  console.error(err);
  process.exit(1);
});

function execNpmInstall(cwd) {
    console.log(`\n=== Running "npm install" in ${cwd} ===\n`);
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['install'], {
      cwd: cwd,
      stdio: 'inherit',
    });
    child.once('error', err => reject(err));
    child.once('exit', (code, signal) => {
      if (code || signal)
        reject(`npm install failed: exit code ${code} signal ${signal}`);
      else
        resolve();
    });
  });
}
