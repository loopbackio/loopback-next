// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import * as util from 'loopback/test/support/util';

describe(`Context bindings - Unlocking bindings`, () => {
  describe('Unlocking a locked binding', () => {
    let ctx;
    let binding;
    before('given a context', createContext);
    before('and a bound key `foo` that is locked', createLockedBinding);

    describe('when the binding', () => {
      context('is unlocked', () => {
        before(unlockBinding);

        it('sets it\'s lock state to false', () => {
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
          const key = 'foo';
          const operation = () => ctx.bind('foo').to('baz');
          expect(operation).to.not.throw(Error, new RegExp(`Cannot rebind key "${key}" because associated binding is locked`));
        });

        it('binds the duplicate key to the new value', () => {
          const result = ctx.get('foo');
          expect(result).to.equal('baz');
        });
      });
    });

    function createContext() {
      ctx = util.getContext();
    }
    function createLockedBinding() {
      binding = ctx.bind('foo').to('bar');
      binding.lock();
    }
  });
});
