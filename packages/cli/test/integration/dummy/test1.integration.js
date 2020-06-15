// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {expectToMatchSnapshot} = require('../../snapshots')();

describe('test1', () => {
  it('matches snapshot 1', () => {
    expectToMatchSnapshot('test1 result');
  });
});

require('./common.integration').commonTest();
