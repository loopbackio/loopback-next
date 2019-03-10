// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const sinon = require('sinon');
const chalk = require('chalk');
const testUtils = require('../../test-utils');
var fs = require('mem-fs-editor').create(require('mem-fs').create());

module.exports = function(artiGenerator) {
  return function() {
    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails', () => {
          assert.throws(() => {
            const gen = testUtils.testSetUpGen(artiGenerator, {
              args: '2foobar',
            });
            gen.setOptions();
          }, Error);
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            const gen = testUtils.testSetUpGen(artiGenerator);
            gen.setOptions();
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            const gen = testUtils.testSetUpGen(artiGenerator, {
              args: ['foobar'],
            });
            gen.setOptions();
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

      it('sets up artifactInfo', async () => {
        let gen = testUtils.testSetUpGen(artiGenerator, {args: ['test']});
        await gen.setOptions();
        assert(gen.artifactInfo);
        assert.equal(gen.artifactInfo.name, 'test');
      });
    });

    describe('checkLoopBackProject', () => {
      let gen;

      beforeEach(() => {
        gen = testUtils.testSetUpGen(artiGenerator);
        gen.fs.readJSON = sinon.stub(fs, 'readJSON');
      });

      afterEach(() => {
        if (gen) gen.fs.readJSON.restore();
      });

      testCheckLoopBack(
        'throws an error if no package.json is present',
        undefined,
        /No package.json found/,
      );

      testCheckLoopBack(
        'throws an error if "@loopback/core" is not a dependency',
        {dependencies: {}},
        /No `@loopback\/core` package found/,
      );

      testCheckLoopBack(
        'throws an error if dependencies have incompatible versions',
        {
          dependencies: {
            '@loopback/context': '^0.0.0',
            '@loopback/core': '^0.0.0',
          },
        },
        /Incompatible dependencies/,
      );

      testCheckLoopBack(
        'allows */x/X for version range',
        {
          devDependencies: {'@types/node': '*'},
          dependencies: {
            '@loopback/context': 'x.x',
            '@loopback/core': 'X.*',
          },
        },
        // No expected error here
      );

      it('passes if "@loopback/core" is a dependency', async () => {
        await gen.checkLoopBackProject();
      });

      function testCheckLoopBack(testName, obj, expected) {
        it(testName, async () => {
          let logs = [];
          gen.log = function(...args) {
            logs = logs.concat(args);
          };
          gen.prompt = async () => ({
            ignoreIncompatibleDependencies: false,
          });
          gen.fs.readJSON.returns(obj);
          await gen.checkLoopBackProject();
          if (!expected) {
            assert(gen.exitGeneration == null);
            return;
          }
          assert(gen.exitGeneration instanceof Error);
          assert(gen.exitGeneration.message.match(expected));
          gen.end();
          assert.equal(
            logs[logs.length - 1],
            chalk.red('Generation is aborted:', gen.exitGeneration),
          );
        });
      }
    });

    describe('promptArtifactName', () => {
      let gen;

      beforeEach(() => {
        gen = testUtils.testSetUpGen(artiGenerator);
        gen.prompt = sinon.stub(gen, 'prompt');
        gen.log = sinon.stub(gen, 'log');
      });

      afterEach(() => {
        if (gen) {
          gen.prompt.restore();
          gen.log.restore();
        }
      });

      it('incorporates user input into artifactInfo', () => {
        gen.prompt.resolves({name: 'foobar'});
        return gen.promptArtifactName().then(() => {
          assert(gen.artifactInfo.name);
          assert(gen.artifactInfo.name === 'foobar');
        });
      });
    });
  };
};
