// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';

describe('Logger', () => {
  describe('Logger test 1', () => {
    it('can log', () => {
      var fake = 1;
      expect(fake).to.deepEqual(1);
    });
  });
});
