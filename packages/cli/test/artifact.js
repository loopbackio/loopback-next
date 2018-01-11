// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const sinon = require('sinon');
const chalk = require('chalk');
const testUtils = require('./test-utils');
var fs = require('mem-fs-editor').create(require('mem-fs').create());

module.exports = function(artiGenerator) {
  return function() {
    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails', () => {
          assert.throws(() => {
            testUtils.testSetUpGen(artiGenerator, {args: '2foobar'});
          }, Error);
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(artiGenerator);
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            testUtils.testSetUpGen(artiGenerator, {args: ['foobar']});
          }, Error);
        });
      });

      it('has name argument set up', () => {
        let gen = testUtils.testSetUpGen(artiGenerator);
        let helpText = gen.help();
        assert(helpText.match(/\[<name>\]/));
        assert(helpText.match(/# Name for the /));
        assert(helpText.match(/Type: String/));
        assert(helpText.match(/Required: false/));
      });

      it('sets up artifactInfo', () => {
        let gen = testUtils.testSetUpGen(artiGenerator, {args: ['test']});
        assert(gen.artifactInfo);
        assert(gen.artifactInfo.name == 'test');
      });
    });

    describe('checkLoopBackProject', () => {
      testCheckLoopBack(
        'throws an error if lbVersion is undefined',
        undefined,
        /Invalid version./
      );
      testCheckLoopBack(
        'throws an error if version is below 4.0.0',
        '3.9.9',
        /Invalid version./
      );

      it('passes if "lbVersion" is "4.0.0" or greater', () => {
        let gen = testUtils.testSetUpGen(artiGenerator);
        gen.config.get = sinon.stub(gen.config, 'get');
        gen.config.get.withArgs('lbVersion').returns('4.0.0');
        assert.doesNotThrow(() => {
          gen.checkLoopBackProject();
        }, Error);
        gen.config.get.restore();
      });

      function testCheckLoopBack(testName, str, expected) {
        it(testName, () => {
          let gen = testUtils.testSetUpGen(artiGenerator);
          let logs = [];
          gen.log = function(...args) {
            logs = logs.concat(args);
          };
          gen.config.get = sinon.stub(gen.config, 'get');
          gen.config.get.withArgs('lbVersion').returns(str);
          gen.checkLoopBackProject();
          assert(gen.exitGeneration instanceof Error);
          assert(gen.exitGeneration.message.match(expected));
          gen.end();
          assert.deepEqual(logs, [
            chalk.red('Generation is aborted:', gen.exitGeneration),
          ]);
          gen.config.get.restore();
        });
      }
    });

    describe('promptArtifactName', () => {
      it('incorporates user input into artifactInfo', () => {
        let gen = testUtils.testSetUpGen(artiGenerator);
        gen.prompt = sinon.stub(gen, 'prompt');
        gen.prompt.resolves({name: 'foobar'});
        return gen.promptArtifactName().then(() => {
          gen.prompt.restore();
          assert(gen.artifactInfo.name);
          assert(gen.artifactInfo.name === 'foobar');
        });
      });
    });
  };
};
