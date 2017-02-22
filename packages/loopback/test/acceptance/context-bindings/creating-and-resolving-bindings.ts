// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import * as util from 'loopback/test/support/util';

describe('Context bindings - Creating and resolving bindings', () => {
  let ctx;
  before('given a context', createContext);

  describe('Simple bindings', () => {
    describe('when a simple binding', () => {
      context('is created with key `foo` and bound to value `bar`', () => {
        before(createBinding);

        it('registers key `foo` into the context', () => {
          expect(ctx.contains('foo')).to.be.true();
        });

        function createBinding() {
          ctx.bind('foo').to('bar');
        }
      });

      context('is resolved', () => {
        it('returns the bound value `bar`', () => {
          const result = ctx.get('foo');
          expect(result).to.equal('bar');
        });
      });
    });
  });

  describe('Dynamic bindings', () => {
    describe('when a dynamic binding is created with three values', () => {
      before(createDynamicBinding);

      context('resolving the binding for the first time', () => {
        it('returns the first value', () => {
          const result = ctx.get('data');
          expect(result).to.equal('a');
        });
      });

      context('resolving the binding for the second time', () => {
        it('returns the second value', () => {
          const result = ctx.get('data');
          expect(result).to.equal('b');
        });
      });

      context('resolving the binding for the third time', () => {
        it('returns the third value', () => {
          const result = ctx.get('data');
          expect(result).to.equal('c');
        });
      });
    });

    function createDynamicBinding() {
      const data = ['a', 'b', 'c'];
      ctx.bind('data').toDynamicValue(function() {
        return data.shift();
      });
    }
  });

  function createContext() {
    ctx = util.getContext();
  }
});
