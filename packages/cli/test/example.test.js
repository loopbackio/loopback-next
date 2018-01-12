// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const fs = require('fs');
const expect = require('@loopback/testlab').expect;
const path = require('path');

const generator = path.join(__dirname, '../generators/example');
const baseTests = require('./base-generator')(generator);
const testUtils = require('./test-utils');

const ALL_EXAMPLES = require(generator).getAllExamples();
const VALID_EXAMPLE = 'codehub';

describe('lb4 example', function() {
  this.timeout(10000);

  describe('correctly extends BaseGenerator', baseTests);

  describe('_setupGenerator', () => {
    it('has name argument set up', () => {
      const helpText = getHelpText();
      expect(helpText)
        .to.match(/\[<example-name>\]/)
        .and.match(/# Name of the example/)
        .and.match(/Type: String/)
        .and.match(/Required: false/);
    });

    it('lists all example names in help', () => {
      const helpText = getHelpText();
      expect(helpText).to.match(
        new RegExp(Object.keys(ALL_EXAMPLES).join('.*'))
      );
    });

    function getHelpText() {
      return testUtils.testSetUpGen(generator).help();
    }
  });

  it('accepts the example name via interactive prompt', () => {
    return testUtils
      .executeGenerator(generator)
      .withPrompts({name: VALID_EXAMPLE})
      .then(() => {
        const targetPkgFile = `loopback4-example-${VALID_EXAMPLE}/package.json`;
        const originalPkgMeta = require('../../example-codehub/package.json');
        assert.file(targetPkgFile);
        assert.jsonFileContent(targetPkgFile, {
          name: originalPkgMeta.name,
          version: originalPkgMeta.version,
        });
      });
  });

  it('accepts the example name as a CLI argument', () => {
    return testUtils
      .executeGenerator(generator)
      .withArguments([VALID_EXAMPLE])
      .then(() => {
        const targetPkgFile = `loopback4-example-${VALID_EXAMPLE}/package.json`;
        const originalPkgMeta = require('../../example-codehub/package.json');
        assert.file(targetPkgFile);
        assert.jsonFileContent(targetPkgFile, {
          name: originalPkgMeta.name,
          version: originalPkgMeta.version,
        });
      });
  });

  it('rejects invalid example names', () => {
    return testUtils
      .executeGenerator(generator)
      .withArguments(['example-does-not-exist'])
      .then(
        () => {
          throw new Error('Generator should have failed.');
        },
        err => {
          expect(err).to.match(/Invalid example name/);
        }
      );
  });
});
