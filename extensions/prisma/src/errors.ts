// Copyright The LoopBack Authors 2021.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, BindingType} from '@loopback/core';

export class PrismaClientInstanceUnsupportedBindingError extends Error {}

export class PrismaClientInstanceUnsupportedBindingScopeError extends PrismaClientInstanceUnsupportedBindingError {
  constructor(supportedScopes: BindingScope | BindingScope[]) {
    const supportedScopesNormalised = Array.isArray(supportedScopes)
      ? supportedScopes
      : [supportedScopes];
    super(
      `Prisma Client instance binding type not one of: ${supportedScopesNormalised.join(
        ',',
      )}.`,
    );
  }
}

export class PrismaClientInstanceUnsupportedBindingTypeError extends PrismaClientInstanceUnsupportedBindingError {
  constructor(supportedTypes: BindingType | BindingType[]) {
    const supportedTypesNormalised = Array.isArray(supportedTypes)
      ? supportedTypes
      : [supportedTypes];
    super(
      `Prisma Client instance binding type not one of: ${supportedTypesNormalised.join(
        ',',
      )}.`,
    );
  }
}

export class PrismaMiddlewareUnsupportedBindingError extends Error {}

export class PrismaMiddlewareUnsupportedBindingScopeError extends PrismaMiddlewareUnsupportedBindingError {
  constructor(supportedScopes: BindingScope | BindingScope[]) {
    const supportedScopesNormalised = Array.isArray(supportedScopes)
      ? supportedScopes
      : [supportedScopes];
    super(
      `Prisma middleware binding scope not one of: ${supportedScopesNormalised.join(
        ',',
      )}.`,
    );
  }
}

export class PrismaMiddlewareUnsupportedBindingTypeError extends PrismaMiddlewareUnsupportedBindingError {
  constructor(supportedTypes: BindingType | BindingType[]) {
    const supportedTypesNormalised = Array.isArray(supportedTypes)
      ? supportedTypes
      : [supportedTypes];
    super(
      `Prisma middleware binding type not one of: ${supportedTypesNormalised.join(
        ',',
      )}.`,
    );
  }
}

export class PrismaClientConfigConflictError extends Error {
  constructor() {
    super(
      'Prisma Client configuration nor logging integration is not permitted with existing Prisma Client instance.',
    );
  }
}

export class PrismaFilterInvalidLB4DirectionError extends Error {
  constructor(invalidDirection: string) {
    super(
      `Invalid direction found in LB4 filter during conversion: ${invalidDirection}`,
    );
  }
}

export class PrismaFilterConflictError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PrismaFilterMalformedLB4NestedProp extends Error {
  constructor(invalidPropKey: string) {
    super(
      `Malformed nested property key found in LB4 filter during conversion: ${invalidPropKey}`,
    );
  }
}

export class PrismaFilterUnsupportedLB4FilterOperatorError extends Error {
  constructor(query: string) {
    super(`Unspported LoopBack 4 filter operator: ${query}`);
  }
}
