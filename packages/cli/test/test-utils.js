// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const yeoman = require('yeoman-environment');
const path = require('path');
const helpers = require('yeoman-test');

exports.testSetUpGen = function(genName, arg) {
  arg = arg || {};
  const env = yeoman.createEnv();
  const name = genName.substring(genName.lastIndexOf(path.sep) + 1);
  env.register(genName, 'loopback4:' + name);
  return env.create('loopback4:' + name, arg);
};

/**
 * Execute the generator via yeoman-test's run() helper,
 * detect exitGeneration flag and convert it into promise rejection.
 *
 * @param {string} GeneratorOrNamespace
 * @param {object} [settings]
 */
exports.executeGenerator = function(GeneratorOrNamespace, settings) {
  const runner = helpers.run(GeneratorOrNamespace, settings);

  // Override .then() and .catch() methods to detect our custom
  // "exit with error" handling
  runner.toPromise = function() {
    return new Promise((resolve, reject) => {
      this.on('end', () => {
        if (this.generator.exitGeneration) {
          reject(this.generator.exitGeneration);
        } else {
          resolve(this.targetDirectory);
        }
      });
      this.on('error', reject);
    });
  };

  return runner;
};
