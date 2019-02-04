// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding} from '../..';

describe(`Context bindings - Unlocking bindings`, () => {
  describe('Unlocking a locked binding', () => {
    let ctx: Context;
    let binding: Binding;
    before('given a context', createContext);
    before('and a bound key `foo` that is locked', createLockedBinding);

    describe('when the binding', () => {
      context('is unlocked', () => {
        before(unlockBinding);

        it("sets it's lock state to false", () => {
          expect(binding.isLocked).to.be.false();
        });

        function unlockBinding() {
          binding.unlock();
        }
      });
    });

    describe('when the context', () => {
      context('rebinds the duplicate key with an unlocked binding', () => {
        it('does not throw a rebinding error', () => {
          const operation = () => ctx.bind('foo').to('baz');
          expect(operation).to.not.throw();
        });

        it('binds the duplicate key to the new value', async () => {
          const result = await ctx.get('foo');
          expect(result).to.equal('baz');
        });
      });
    });

    function createContext() {
      ctx = new Context();
    }
    function createLockedBinding() {
      binding = ctx.bind('foo').to('bar');
      binding.lock();
    }
  });
});
