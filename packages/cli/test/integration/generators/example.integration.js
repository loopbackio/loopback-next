// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('yeoman-assert');
const expect = require('@loopback/testlab').expect;
const path = require('path');

const generator = path.join(__dirname, '../../../generators/example');
const baseTests = require('../lib/base-generator')(generator);
const testUtils = require('../../test-utils');

const ALL_EXAMPLES = require('../../../generators/example').getAllExamples();
const VALID_EXAMPLE = 'todo';

describe('lb4 example', function() {
  // eslint-disable-next-line no-invalid-this
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
      for (const key of Object.keys(ALL_EXAMPLES)) {
        expect(helpText).to.match(new RegExp(`${key}: (.*?)`));
      }
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
        const targetPkgFile = 'package.json';
        const originalPkgMeta = require(`../../../../../examples/${VALID_EXAMPLE}/package.json`);
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
        const targetPkgFile = 'package.json';
        const originalPkgMeta = require(`../../../../../examples/${VALID_EXAMPLE}/package.json`);
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
        },
      );
  });
});
