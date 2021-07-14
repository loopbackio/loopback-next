// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {expectToMatchSnapshot} = require('../../snapshots');
const {commonTestSuite} = require('./common.suite');

describe('snapshot-matcher first case', () => {
  commonTestSuite();

  it('matches snapshot', () => {
    expectToMatchSnapshot('first case');
  });
});
