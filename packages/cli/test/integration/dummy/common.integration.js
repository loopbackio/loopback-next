// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const {expectToMatchSnapshot} = require('../../snapshots')();

exports.commonTest = function () {
  describe('common', () => {
    it('matches snapshot 1', function () {
      expectToMatchSnapshot('common result');
    });
  });
};
