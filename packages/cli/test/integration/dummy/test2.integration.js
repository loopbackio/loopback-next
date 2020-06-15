// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {expectToMatchSnapshot} = require('../../snapshots')();

describe('test2', () => {
  it('matches snapshot 2', () => {
    expectToMatchSnapshot('test2 result');
  });
});

require('./common.integration').commonTest();
