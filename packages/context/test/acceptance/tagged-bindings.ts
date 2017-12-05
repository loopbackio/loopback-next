// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, Binding} from '../..';

describe('Context bindings - Tagged bindings', () => {
  let ctx: Context;
  let binding: Binding;
  before('given a context', createContext);
  before(createBinding);

  describe('tag', () => {
    context('when the binding is tagged', () => {
      before(tagBinding);

      it('has a tag name', () => {
        expect(binding.tags.has('qux')).to.be.true();
      });

      function tagBinding() {
        binding.tag('qux');
      }
    });

    context('when the binding is tagged with multiple names', () => {
      before(tagBinding);

      it('has tags', () => {
        expect(binding.tags.has('x')).to.be.true();
        expect(binding.tags.has('y')).to.be.true();
      });

      function tagBinding() {
        binding.tag(['x', 'y']);
      }
    });
  });

  function createContext() {
    ctx = new Context();
  }
  function createBinding() {
    binding = ctx.bind('foo').to('bar');
  }
});
