// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const assert = require('yeoman-assert');
const sinon = require('sinon');
const chalk = require('chalk');
const testUtils = require('../../test-utils');
const fs = require('mem-fs-editor').create(require('mem-fs').create());
const pkgJson = require('../../../package.json');

/**
 * Get current versions for `@loopback/context` and `@loopback/core` from
 * the template
 */
const contextVer = pkgJson.config.templateDependencies['@loopback/context'];
const coreVer = pkgJson.config.templateDependencies['@loopback/core'];
const buildVer = pkgJson.config.templateDependencies['@loopback/build'];

/***
 * Parse version range (for example, `'^1.24.3'`) to an object such as
 * `{major: 1, minor: 24, patch: 3}`
 *
 * @param {string} versionRange
 */
function parseVersion(versionRange) {
  const result = /(\^|\~)(\d+)\.(\d+)\.(\d+)/.exec(versionRange);
  return {major: +result[2], minor: +result[3], patch: +result[4]};
}

/**
 * Get a new patch version for compatible semver
 * @param {string} versionRange
 */
function getNewPatch(versionRange) {
  const ver = parseVersion(versionRange);
  return `${ver.major}.${ver.minor}.${+ver.patch + 1}`;
}

/**
 * Get a new major version for incompatible semver
 * @param {string} versionRange
 */
function getNewMajor(versionRange) {
  const ver = parseVersion(versionRange);
  return `${+ver.major + 1}.${ver.minor}.${+ver.patch}`;
}

module.exports = function suiteCheckLoopBackProject(generator) {
  describe('checkLoopBackProject', () => {
    let gen;

    beforeEach(() => {
      gen = testUtils.testSetUpGen(generator);
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
      'throws an error for incompatible patch versions with semver=false',
      {
        dependencies: {
          '@loopback/context': getNewPatch(contextVer),
          '@loopback/core': coreVer,
        },
      },
      /Incompatible dependencies/,
      {decision: 'abort', command: 'update', semver: false},
    );

    testCheckLoopBack(
      'throws an error for incompatible major versions with semver=false',
      {
        dependencies: {
          '@loopback/context': getNewMajor(contextVer),
          '@loopback/core': coreVer,
        },
      },
      /Incompatible dependencies/,
      {decision: 'abort', command: 'update', semver: false},
    );

    testCheckLoopBack(
      'allows compatible patch versions with semver=true',
      {
        dependencies: {
          '@loopback/context': getNewPatch(contextVer),
          '@loopback/core': coreVer,
        },
      },
      [
        chalk.green(
          `The project dependencies are compatible with @loopback/cli@${pkgJson.version}`,
        ),
      ],
      {decision: 'upgrade', command: 'update', semver: true},
    );

    testCheckLoopBack(
      'throws an error for incompatible major versions with semver=true',
      {
        dependencies: {
          '@loopback/context': getNewMajor(contextVer),
          '@loopback/core': coreVer,
        },
      },
      /Incompatible dependencies/,
      {decision: 'abort', command: 'update', semver: false},
    );

    testCheckLoopBack(
      'upgrades older versions',
      {
        dependencies: {
          '@loopback/context': '^0.1.0',
          '@loopback/core': '^0.1.0',
        },
        devDependencies: {
          '@loopback/build': '^0.1.0',
        },
      },
      [
        `- Dependency @loopback/context: ^0.1.0 => ${contextVer}`,
        `- Dependency @loopback/core: ^0.1.0 => ${coreVer}`,
        `- DevDependency @loopback/build: ^0.1.0 => ${buildVer}`,
      ],
      {decision: 'upgrade'},
    );

    testCheckLoopBack(
      'skip older versions',
      {
        dependencies: {
          '@loopback/context': '^0.1.0',
          '@loopback/core': '^0.1.0',
        },
        devDependencies: {
          '@loopback/build': '^0.1.0',
        },
      },
      [
        '@loopback/build',
        '^0.1.0',
        `${buildVer}`,
        '@loopback/context',
        '^0.1.0',
        `${contextVer}`,
        '@loopback/core',
        '^0.1.0',
        `${coreVer}`,
      ],
      {decision: 'continue'},
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

    function testCheckLoopBack(
      testName,
      obj,
      expected,
      options = {decision: 'abort'},
    ) {
      it(testName, async () => {
        let logs = [];
        gen.log = function (...args) {
          logs = logs.concat(args);
        };
        gen.command = options.command;
        gen.options = gen.options || {};
        gen.options.semver = options.semver;
        gen.prompt = async () => ({
          decision: options.decision,
        });
        gen.fs.readJSON.returns(obj);
        await gen.checkLoopBackProject();
        if (!expected) {
          assert(gen.exitGeneration == null);
          return;
        }
        // expected is an array of messages
        if (Array.isArray(expected)) {
          for (const i of expected) {
            assert.notEqual(logs.indexOf(i), -1, `${i} not found in the log`);
          }
          return;
        }
        // expected is a string for error
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
};
