// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const yeoman = require('yeoman-environment');

exports.testSetUpGen = function(genName, arg) {
  arg = arg || {};
  const env = yeoman.createEnv();
  const name = genName.substring(genName.lastIndexOf('/') + 1);
  env.register(genName, 'loopback4:' + name);
  return env.create('loopback4:' + name, arg);
};
