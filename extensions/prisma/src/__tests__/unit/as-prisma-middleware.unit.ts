// SPDX-FileCopyrightNotice: LoopBack Contributors
// SPDX-License-Identifier: MIT
// Node module: @loopback/prisma

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
