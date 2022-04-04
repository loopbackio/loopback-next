// SPDX-FileCopyrightNotice: LoopBack Contributors
// SPDX-License-Identifier: MIT
// Node module: @loopback/prisma

import {
  Binding,
  BindingScope,
  BindingTemplate,
  extensionFor,
} from '@loopback/core';
import {PrismaBindings} from '../keys';

/**
 * Usually used with {@link @loopback/core#Binding.apply} to apply the
 * necessary {@link @loopback/core#Binding} attributes to enable Prisma
 * Middleware discovery by {@link ../PrismaComponent | PrismaComponent}.
 *
 * @remarks
 * It does 2 things:
 * - Applies `extensionFor(PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT)`
 * - Sets the scope to {@link @loopback/core#BindingScope.SINGLETON}.
 *
 * @param binding A target {@link @loopback/core#Binding}.
 * @returns Target {@link @loopback/core#Binding}, modified.
 */
export const asPrismaMiddleware: BindingTemplate = (binding: Binding) => {
  return binding
    .apply(extensionFor(PrismaBindings.PRISMA_MIDDLEWARE_EXTENSION_POINT))
    .inScope(BindingScope.SINGLETON);
};
