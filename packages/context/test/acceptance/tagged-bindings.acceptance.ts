// Copyright IBM Corp. 2017,2018. All Rights Reserved.
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
        expect(binding.tagNames).to.containEql('controller');
      });

      function tagBinding() {
        binding.tag('controller');
      }
    });

    context('when the binding is tagged with multiple names', () => {
      before(tagBinding);

      it('has tags', () => {
        expect(binding.tagNames).to.containEql('controller');
        expect(binding.tagNames).to.containEql('rest');
      });

      function tagBinding() {
        binding.tag('controller', 'rest');
      }
    });

    context('when the binding is tagged with name/value objects', () => {
      before(tagBinding);

      it('has tags', () => {
        expect(binding.tagNames).to.containEql('controller');
        expect(binding.tagNames).to.containEql('name');
        expect(binding.tagMap).to.containEql({
          name: 'my-controller',
          controller: 'controller',
        });
      });

      function tagBinding() {
        binding.tag({name: 'my-controller'}, 'controller');
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
