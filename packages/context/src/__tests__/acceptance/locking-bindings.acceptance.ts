// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding} from '../..';

describe('Context bindings - Locking bindings', () => {
  describe('Binding with a duplicate key', () => {
    let ctx: Context;
    let binding: Binding;
    before('given a context', createContext);
    before('and a bound key `foo`', createBinding);

    describe('when the binding', () => {
      context('is created', () => {
        it('is locked by default', () => {
          expect(binding.isLocked).to.be.false();
        });
      });

      context('is locked', () => {
        before(lockBinding);

        it("sets it's lock state to true", () => {
          expect(binding.isLocked).to.be.true();
        });

        function lockBinding() {
          binding.lock();
        }
      });
    });

    describe('when the context', () => {
      context('is binding to an existing key', () => {
        it('throws a rebind error', () => {
          const key = 'foo';
          const operation = () => ctx.bind('foo');
          expect(operation).to.throw(
            new RegExp(`Cannot rebind key "${key}" to a locked binding`),
          );
        });
      });
    });

    function createContext() {
      ctx = new Context();
    }
    function createBinding() {
      binding = ctx.bind('foo');
    }
  });
});
