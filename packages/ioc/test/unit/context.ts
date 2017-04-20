// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from 'testlab';
import {Context, Binding} from '../..';

describe('Context', () => {
  let ctx;
  before('given a context', createContext);

  describe('bind', () => {
    let binding;
    before('create a binding', createBinding);

    it('adds a binding into the registry', () => {
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('returns a binding', () => {
      expect(binding).to.be.instanceOf(Binding);
    });

    function createBinding() {
      binding = ctx.bind('foo');
    }
  });

  describe('contains', () => {
    it('returns true when the key is the registry', () => {
      ctx.bind('foo');
      const result = ctx.contains('foo');
      expect(result).to.be.true();
    });

    it('returns false when the key is not in the registry', () => {
      const result = ctx.contains('bar');
      expect(result).to.be.false();
    });
  });

  function createContext() {
    ctx = new Context();
  }
});
