// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const testUtils = require('../../test-utils');
const path = require('path');
const mockStdin = require('mock-stdin');
const process = require('process');

module.exports = function(generator, env = {}) {
  if (!env.args) env = {...env, args: []};

  return function() {
    describe('usage', () => {
      it('prints lb4', () => {
        process.chdir(path.resolve(__dirname, '..', '..', '..'));
        const gen = testUtils.testSetUpGen(generator, env);
        const helpText = gen.help();
        assert(helpText.match(/lb4 /));
        assert(!helpText.match(/loopback4:/));
      });
    });

    describe('exit', () => {
      it('does nothing if false is passed', () => {
        const gen = testUtils.testSetUpGen(generator, env);
        gen.exit(false);
        assert(gen.exitGeneration === undefined);
      });
      it('sets "exitGeneration" to true if called with no argument', () => {
        const gen = testUtils.testSetUpGen(generator, env);
        gen.exit();
        assert(gen.exitGeneration === true);
      });
      it('sets "exitGeneration" to the error passed to itself', () => {
        const gen = testUtils.testSetUpGen(generator, env);
        gen.exit(new Error('oh no'));
        assert(gen.exitGeneration instanceof Error);
        assert.equal(gen.exitGeneration.message, 'oh no');
      });

      after(() => {
        // Reset the exit code so that mocha will not complain
        process.exitCode = 0;
      });
    });

    describe('config from json file', () => {
      it('accepts --config', async () => {
        const jsonFile = path.join(__dirname, 'base-config.json');
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--config', jsonFile, ...env.args],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonFile);
        assert.equal(gen.options.name, 'xyz');
      });

      it('options from json file do not override', async () => {
        const jsonFile = path.join(__dirname, 'base-config.json');
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--name', 'abc', '--config', jsonFile, ...env.args],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonFile);
        assert.equal(gen.options.name, 'abc');
        assert.equal(gen.options.description, 'Test');
      });

      it('fails fast if --config has invalid value', async () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: [
            '--config',
            path.join(__dirname, 'base-config-invalid.json'),
            ...env.args,
          ],
        });
        await gen.setOptions();
        assert(gen.exitGeneration instanceof Error);
      });
    });

    describe('config from json value', () => {
      const jsonValue = `{
        "name": "xyz",
        "description": "Test"
      }`;

      const invalidJsonValue = `{
        name: "xyz",
        "description": "Test"
      }`;

      it('accepts --config', async () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--config', jsonValue, ...env.args],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonValue);
        assert.equal(gen.options.name, 'xyz');
      });

      it('options from json file do not override', async () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--name', 'abc', '--config', jsonValue, ...env.args],
        });
        await gen.setOptions();
        assert.equal(gen.options['config'], jsonValue);
        assert.equal(gen.options.name, 'abc');
        assert.equal(gen.options.description, 'Test');
      });

      it('fails fast if --config has invalid value', async () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--config', invalidJsonValue, ...env.args],
        });
        await gen.setOptions();
        assert(gen.exitGeneration instanceof Error);
      });
    });

    describe('config from stdin', () => {
      let mock;

      before(() => {
        mock = mockStdin.stdin();
      });

      after(() => {
        mock.restore();
      });

      afterEach(() => {
        mock.reset(true);
      });

      it('accepts --config stdin', () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--config', 'stdin', ...env.args],
        });
        const promise = gen.setOptions();
        assert.equal(gen.options['config'], 'stdin');
        // Reading config from stdin will skip optional prompts
        assert.equal(gen.options['yes'], true);
        mock.send('{');
        mock.send('"name": "xyz"');
        mock.send('}');
        mock.end();
        return promise.then(() => {
          assert.equal(gen.options.name, 'xyz');
        });
      });

      it('reports invalid json from stdin', () => {
        const gen = testUtils.testSetUpGen(generator, {
          ...env,
          args: ['--config', 'stdin', ...env.args],
        });
        const promise = gen.setOptions();
        assert.equal(gen.options['config'], 'stdin');
        // Reading config from stdin will skip optional prompts
        assert.equal(gen.options['yes'], true);
        mock.send('{');
        mock.send('"name": xyz"');
        mock.send('}');
        mock.end();
        return promise.catch(err => {
          assert.equal(
            err,
            'SyntaxError: Unexpected token x in JSON at position 9',
          );
        });
      });
    });
  };
};
