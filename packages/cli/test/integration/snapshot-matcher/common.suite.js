// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// A shared test suite executed by "suite-first-run.integration.js"
// and "suite-second-run.integration.js"
const {expectToMatchSnapshot} = require('../../snapshots');

/**
 * Execute this method from inside a `describe()` block in your test file.
 */
exports.commonTestSuite = function () {
  describe('shared test', () => {
    it('matches snapshot', function () {
      expectToMatchSnapshot('common result');
    });
  });
};
