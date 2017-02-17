// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('Context bindings - Resolving bindings', () => {
  let ctx;
  before('given a context', createContext);

  describe('Resolving a binding', () => {
    describe('when the binding', () => {
      context('is created with key `foo` bound to value `bar`', () => {
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

  function createContext() {
    ctx = util.getContext();
  }
});
