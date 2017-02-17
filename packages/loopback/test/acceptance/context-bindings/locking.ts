// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import * as util from 'loopback/test/support/util';

describe('Context bindings - Locking bindings', () => {
  describe('Binding with a duplicate key', () => {
    let ctx;
    let binding;
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

        it('sets it\'s lock state to true', () => {
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
          expect(operation).to.throw(Error, new RegExp(`Cannot rebind key "${key}" because associated binding is locked`));
        });
      });
    });

    function createContext() {
      ctx = util.getContext();
    }
    function createBinding() {
      binding = ctx.bind('foo');
    }
  });
});
