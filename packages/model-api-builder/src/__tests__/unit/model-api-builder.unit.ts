// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/model-api-builder
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingKey} from '@loopback/context';
import {expect} from '@loopback/testlab';
import {asModelApiBuilder, MODEL_API_BUILDER_PLUGINS} from '../..';

describe('model-api-builder', () => {
  describe('MODEL_API_BUILDER_PLUGINS', () => {
    it('is the string "model-api-builders"', () => {
      expect(MODEL_API_BUILDER_PLUGINS).to.equal('model-api-builders');
    });
  });

  describe('asModelApiBuilder()', () => {
    let binding: Binding<unknown>;

    beforeEach(() => {
      binding = new Binding(BindingKey.create('test.builder'));
    });

    it('tags the binding as an extension of MODEL_API_BUILDER_PLUGINS', () => {
      asModelApiBuilder(binding);

      expect(binding.tagMap).to.containEql({
        extensionFor: MODEL_API_BUILDER_PLUGINS,
      });
    });

    it('adds a "namespace" tag equal to MODEL_API_BUILDER_PLUGINS', () => {
      asModelApiBuilder(binding);

      expect(binding.tagMap).to.containEql({
        namespace: MODEL_API_BUILDER_PLUGINS,
      });
    });

    it('includes "extensionFor" and "namespace" in tagNames', () => {
      asModelApiBuilder(binding);

      expect(binding.tagNames).to.containDeep(['extensionFor', 'namespace']);
    });

    it('applies the template without altering the binding key', () => {
      const key = 'test.builder';
      asModelApiBuilder(binding);

      expect(binding.key).to.equal(key);
    });
  });
});
