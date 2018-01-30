#!/usr/bin/env node
// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-microservices
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const Promise = require('bluebird');
const exec = require('child_process').execSync;
const spawn = require('child_process').spawn;
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');

const cmd = path.resolve(__dirname, '..', 'node_modules', '.bin', '_mocha');
const args = ['--compilers', 'ts:ts-node/register,tsx:ts-node/register'];

const services = path.resolve(__dirname, '..', 'services');
return fs
  .readdirAsync(services)
  .then(folders => {
    return Promise.each(folders, f => {
      const dir = path.resolve(services, f);
      return fs
        .readdirAsync(dir)
        .then(subfolders => {
          if (subfolders.indexOf('test') > -1) {
            return new Promise((resolve, reject) => {
              console.log('RUN TESTS - %s:', f);
              const testArgs = args.push(path.resolve(dir, 'test/**/*test.ts'));
              const test = spawn(cmd, args, {stdio: 'inherit'});
              test.on('close', code => {
                if (code) {
                  return reject(code);
                } else {
                  console.log('TEST SUCCESS - %s', f);
                  return resolve();
                }
              });
            });
          } else {
            console.log('No "test" folder was found in %s', f);
            return Promise.resolve();
          }
        })
        .catch(code => {
          return Promise.reject(`TESTS FAILED - ${f}, exit code ${code}`);
        });
    }).then(() => {
      console.log('TESTS COMPLETE');
    });
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
