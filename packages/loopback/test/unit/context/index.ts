// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Binding} from 'loopback/lib/context/binding';
import * as util from 'loopback/test/support/util';

describe('Context', () => {
  let ctx;
  beforeEach('given a context', getContext);

  describe('bind', () => {
    let binding;
    beforeEach('create a binding', createBinding);

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
  });

  function getContext() {
    ctx = util.getContext();
  }
});
