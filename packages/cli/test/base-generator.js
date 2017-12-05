// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const testUtils = require('./test-utils');

module.exports = function(generator) {
  return function() {
    describe('usage', () => {
      it('prints lb4', () => {
        let gen = testUtils.testSetUpGen(generator);
        let helpText = gen.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });
    describe('exit', () => {
      it('does nothing if false is passed', () => {
        let gen = testUtils.testSetUpGen(generator);
        gen.exit(false);
        assert(gen.exitGeneration === undefined);
      });
      it('sets "exitGeneration" to true if called with no argument', () => {
        let gen = testUtils.testSetUpGen(generator);
        gen.exit();
        assert(gen.exitGeneration === true);
      });
      it('sets "exitGeneration" to the error passed to itself', () => {
        let gen = testUtils.testSetUpGen(generator);
        gen.exit(new Error('oh no'));
        assert(gen.exitGeneration instanceof Error);
        assert(gen.exitGeneration.message === 'oh no');
      });
    });
  };
};
