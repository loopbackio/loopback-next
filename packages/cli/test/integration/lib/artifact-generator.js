// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const sinon = require('sinon');
const testUtils = require('../../test-utils');
const suiteCheckLoopBackProject = require('./check-loopback-project.suite');

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
        const gen = testUtils.testSetUpGen(artiGenerator);
        const helpText = gen.help();
        assert(helpText.match(/\[<name>\]/));
        assert(helpText.match(/# Name for the /));
        assert(helpText.match(/Type: String/));
        assert(helpText.match(/Required: false/));
      });

      it('sets up artifactInfo', async () => {
        const gen = testUtils.testSetUpGen(artiGenerator, {args: ['test']});
        await gen.setOptions();
        assert(gen.artifactInfo);
        assert.equal(gen.artifactInfo.name, 'test');
      });
    });

    suiteCheckLoopBackProject(artiGenerator);

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
