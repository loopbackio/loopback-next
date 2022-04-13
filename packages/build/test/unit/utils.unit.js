// Copyright IBM Corp. and LoopBack contributors 2019,2020. All Rights Reserved.
// Node module: @loopback/build
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const assert = require('assert');
const utils = require('../../bin/utils');

describe('Build utils', () => {
  describe('getPackageName()', () => {
    it('supports simple packages', () => {
      assert.equal(utils.getPackageName('typescript/bin/tsc'), 'typescript');
    });

    it('supports scoped packages', () => {
      assert.equal(
        utils.getPackageName('@loopback/cli/bin/cli-main'),
        '@loopback/cli',
      );
    });
  });
});
