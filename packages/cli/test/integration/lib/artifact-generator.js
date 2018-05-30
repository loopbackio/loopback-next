// Copyright IBM Corp. 2017. All Rights Reserved.
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
      testCheckLoopBack(
        'throws an error if no package.json is present',
        undefined,
        /No package.json found/,
      );
      testCheckLoopBack(
        'throws an error if "keywords" key does not exist',
        {foobar: 'test'},
        /No `loopback` keyword found/,
      );
      testCheckLoopBack(
        'throws an error if "keywords" key does not map to an array with "loopback" as a member',
        {keywords: ['foobar', 'test']},
        /No `loopback` keyword found/,
      );

      it('passes if "keywords" maps to "loopback"', () => {
        let gen = testUtils.testSetUpGen(artiGenerator);
        gen.fs.readJSON = sinon.stub(fs, 'readJSON');
        gen.fs.readJSON.returns({keywords: ['test', 'loopback']});
        assert.doesNotThrow(() => {
          gen.checkLoopBackProject();
        }, Error);
        gen.fs.readJSON.restore();
      });

      function testCheckLoopBack(testName, obj, expected) {
        it(testName, () => {
          let gen = testUtils.testSetUpGen(artiGenerator);
          let logs = [];
          gen.log = function(...args) {
            logs = logs.concat(args);
          };
          gen.fs.readJSON = sinon.stub(fs, 'readJSON');
          gen.fs.readJSON.returns(obj);
          gen.checkLoopBackProject();
          assert(gen.exitGeneration instanceof Error);
          assert(gen.exitGeneration.message.match(expected));
          gen.end();
          assert.deepEqual(logs, [
            chalk.red('Generation is aborted:', gen.exitGeneration),
          ]);
          gen.fs.readJSON.restore();
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
