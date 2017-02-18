// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('Context bindings - Finding bindings', () => {
  let ctx;

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
        expect(keys).to.include('foo', 'baz');
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
        expect(keys).to.include('my.foo', 'my.baz');
        expect(keys).to.not.include('ur.quux');
      });
    });
  });

  function createContext() {
    ctx = util.getContext();
  }
  function createBinding(key, value) {
    ctx.bind(key).to(value);
  }
});
