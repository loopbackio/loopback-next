// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Binding} from 'loopback/lib/context/binding';

describe('Binding', () => {
  describe('constructor', () => {
    it('sets the given key', () => {
      const key = 'foo';
      const binding = new Binding(key);
      const result = binding.key;
      expect(result).to.equal(key);
    });
  });
});
