// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, BoundValue} from '../..';

describe('Context bindings - Finding bindings', () => {
  let ctx: Context;

  describe('Finding all binding', () => {
    before('given a context', createContext);
    before('with two simple bindings', () => {
      createBinding('foo', 'bar');
      createBinding('baz', 'qux');
    });

    describe('when I find all bindings', () => {
      it('returns all bindings', () => {
        const bindings = ctx.find();
        const keys = bindings.map(binding => {
          return binding.key;
        });
        expect(keys).to.containDeep(['foo', 'baz']);
      });
    });
  });

  describe('Finding bindings by pattern', () => {
    before('given a context', createContext);
    before('with namespaced bindings', () => {
      createBinding('my.foo', 'bar');
      createBinding('my.baz', 'qux');
      createBinding('ur.quux', 'quuz');
    });

    describe('when I find all bindings using a pattern', () => {
      it('returns all bindings matching the pattern', () => {
        const bindings = ctx.find('my.*');
        const keys = bindings.map(binding => binding.key);
        expect(keys).to.containDeep(['my.foo', 'my.baz']);
        expect(keys).to.not.containDeep(['ur.quux']);
      });
    });
  });

  describe('Finding bindings by tag', () => {
    before('given a context', createContext);
    before('with tagged bindings', createTaggedBindings);

    describe('when I find binding by tag', () => {
      it('returns all bindings matching the tag', () => {
        const bindings = ctx.findByTag('dog');
        const dogs = bindings.map(binding => binding.key);
        expect(dogs).to.containDeep(['spot', 'fido']);
      });
    });

    function createTaggedBindings() {
      class Dog {}
      ctx
        .bind('spot')
        .to(new Dog())
        .tag('dog');
      ctx
        .bind('fido')
        .to(new Dog())
        .tag('dog');
    }
  });

  function createContext() {
    ctx = new Context();
  }
  function createBinding(key: string, value: BoundValue) {
    ctx.bind(key).to(value);
  }
});
