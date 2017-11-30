// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const yeoman = require('yeoman-environment');
const sinon = require('sinon');
const chalk = require('chalk');
var fs = require('mem-fs-editor').create(require('mem-fs').create());

module.exports = function(artiGenerator) {
  return function() {
    describe('_setupGenerator', () => {
      describe('args validation', () => {
        it('errors out if validation fails', () => {
          assert.throws(() => {
            testSetUpGen({args: '2foobar'});
          }, Error);
        });

        it('succeeds if no arg is provided', () => {
          assert.doesNotThrow(() => {
            testSetUpGen();
          }, Error);
        });

        it('succeeds if arg is valid', () => {
          assert.doesNotThrow(() => {
            testSetUpGen({args: ['foobar']});
          }, Error);
        });
      });

      it('has name argument set up', () => {
        let gen = testSetUpGen();
        let helpText = gen.help();
        assert(helpText.match(/\[<name>\]/));
        assert(helpText.match(/\# Name for the /));
        assert(helpText.match(/Type: String/));
        assert(helpText.match(/Required: false/));
      });

      it('sets up artifactInfo', () => {
        let gen = testSetUpGen({args: ['test']});
        assert(gen.artifactInfo);
        assert(gen.artifactInfo.name == 'test');
      });
    });

    describe('usage', () => {
      it('prints lb4', () => {
        let gen = testSetUpGen();
        let helpText = gen.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });

    describe('checkLoopBackProject', () => {
      testCheckLoopBack(
        'throws an error if no package.json is present',
        undefined,
        /No package.json found/
      );
      testCheckLoopBack(
        'throws an error if "keywords" key does not exist',
        {foobar: 'test'},
        /No `loopback` keyword found/
      );
      testCheckLoopBack(
        'throws an error if "keywords" key does not map to an array with "loopback" as a member',
        {keywords: ['foobar', 'test']},
        /No `loopback` keyword found/
      );

      it('passes if "keywords" maps to "loopback"', () => {
        let gen = testSetUpGen();
        gen.fs.readJSON = sinon.stub(fs, 'readJSON');
        gen.fs.readJSON.returns({keywords: ['test', 'loopback']});
        assert.doesNotThrow(() => {
          gen.checkLoopBackProject();
        }, Error);
        gen.fs.readJSON.restore();
      });

      function testCheckLoopBack(testName, obj, expected) {
        it(testName, () => {
          let gen = testSetUpGen();
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
        let gen = testSetUpGen();
        gen.prompt = sinon.stub(gen, 'prompt');
        gen.prompt.resolves({name: 'foobar'});
        return gen.promptArtifactName().then(() => {
          gen.prompt.restore();
          assert(gen.artifactInfo.name);
          assert(gen.artifactInfo.name === 'foobar');
        });
      });
    });

    // returns the generator
    function testSetUpGen(arg) {
      arg = arg || {};
      const env = yeoman.createEnv();
      const name = artiGenerator.substring(artiGenerator.lastIndexOf('/') + 1);
      env.register(artiGenerator, 'loopback4:' + name);
      return env.create('loopback4:' + name, arg);
    }
  };
};
