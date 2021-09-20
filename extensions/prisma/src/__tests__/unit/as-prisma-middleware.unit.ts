// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingScope, CoreTags} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {asPrismaMiddleware, PrismaBindings} from '../../';

describe('asPrismaMiddleware', () => {
  it('configures existing, unbound, tagged, singleton Binding', () => {
    const binding = new Binding('aBindingKey');
    asPrismaMiddleware(binding);
    expect(binding.scope).to.equal(BindingScope.SINGLETON);
    expect(binding.tagMap).to.deepEqual({
      [CoreTags.EXTENSION_FOR]:
        PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT,
    });
    expect(binding.type).to.be.undefined();
    expect(binding.isLocked).to.be.false();
  });
});
