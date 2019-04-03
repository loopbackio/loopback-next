// Copyright IBM Corp. 2019. All Rights Reserved.
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

    it('accepts bindings MATCHING the provided tag regexp', () => {
      const filter = filterByTag(/^c/);
      binding.tag('controller');
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided tag regexp', () => {
      const filter = filterByTag(/^c/);
      binding.tag('dataSource');
      expect(filter(binding)).to.be.false();
    });

    it('accepts bindings MATCHING the provided tag map', () => {
      const filter = filterByTag({controller: 'my-controller'});
      binding.tag({controller: 'my-controller'});
      binding.tag({name: 'my-controller'});
      expect(filter(binding)).to.be.true();
    });

    it('accepts bindings MATCHING the provided tag map with multiple tags', () => {
      const filter = filterByTag({
        controller: 'my-controller',
        name: 'my-name',
      });
      binding.tag({controller: 'my-controller'});
      binding.tag({name: 'my-name'});
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided tag map', () => {
      const filter = filterByTag({controller: 'your-controller'});
      binding.tag({controller: 'my-controller'});
      binding.tag({name: 'my-controller'});
      expect(filter(binding)).to.be.false();
    });

    it('rejects bindings NOT MATCHING the provided tag map with multiple tags', () => {
      const filter = filterByTag({
        controller: 'my-controller',
        name: 'my-name',
      });
      binding.tag({controller: 'my-controller'});
      binding.tag({name: 'my-controller'});
      expect(filter(binding)).to.be.false();
    });
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

    it('accepts bindings MATCHING the provided key regexp', () => {
      const filter = filterByKey(/f.*/);
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided key regexp', () => {
      const filter = filterByKey(/^ba/);
      expect(filter(binding)).to.be.false();
    });

    it('accepts bindings MATCHING the provided filter', () => {
      const filter = filterByKey(b => b.key === key);
      expect(filter(binding)).to.be.true();
    });

    it('rejects bindings NOT MATCHING the provided filter', () => {
      const filter = filterByKey(b => b.key !== key);
      expect(filter(binding)).to.be.false();
    });
  });

  function givenBinding() {
    binding = new Binding(key);
  }
});
