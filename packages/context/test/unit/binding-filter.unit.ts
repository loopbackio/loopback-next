// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Binding, filterByKey, filterByTag} from '../..';

const key = 'foo';

describe('BindingFilter', () => {
  let binding: Binding;
  beforeEach(givenBinding);

  describe('filterByTag', () => {
    it('accepts bindings MATCHING the provided tag name', () => {
      const filter = filterByTag('controller');
      binding.tag('controller');
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided tag name', () => {
      const filter = filterByTag('controller');
      binding.tag('dataSource');
      expect(filter(binding)).to.be.false();
    });

    // TODO: filter by tag map, filter by regexp
  });

  describe('filterByKey', () => {
    it('accepts bindings MATCHING the provided key', () => {
      const filter = filterByKey(key);
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided key', () => {
      const filter = filterByKey(`another-${key}`);
      expect(filter(binding)).to.be.false();
    });

    // TODO: filter by regexp, filter by BindingFunction
  });

  function givenBinding() {
    binding = new Binding(key);
  }
});
