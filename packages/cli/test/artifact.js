// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const yeoman = require('yeoman-environment');

module.exports = function(artiGenerator) {
  return function() {
    describe('artifact help', () => {
      it('prints lb4', () => {
        const env = yeoman.createEnv();
        const name = artiGenerator.substring(
          artiGenerator.lastIndexOf('/') + 1
        );
        env.register(artiGenerator, 'loopback4:' + name);
        const generator = env.create('loopback4:' + name);
        const helpText = generator.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });
  };
};
