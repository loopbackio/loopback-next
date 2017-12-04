'use strict';

const yeoman = require('yeoman-environment');

exports.testSetUpGen = function(genName, arg) {
  arg = arg || {};
  const env = yeoman.createEnv();
  const name = genName.substring(genName.lastIndexOf('/') + 1);
  env.register(genName, 'loopback4:' + name);
  return env.create('loopback4:' + name, arg);
};
