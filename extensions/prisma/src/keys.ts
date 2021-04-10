// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {PrismaClient} from '.prisma/client';
import {BindingKey, CoreBindings} from '@loopback/core';
import {PrismaComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace PrismaBindings {
  const NAMESPACE = 'prisma';

  export const COMPONENT = BindingKey.create<PrismaComponent>(
    `${CoreBindings.COMPONENTS}.PrismaComponent`,
  );

  /**
   * @internalRemarks
   * This binding key's name is suffixed with `_INSTANCE` to denote that an
   * already-initialized instance must be bound (i.e.
   * {@link @loopback/core#Binding.toClass} must not be used).
   */
  export const PRISMA_CLIENT_INSTANCE = BindingKey.create<PrismaClient>(
    `${NAMESPACE}.client_instance`,
  );

  export const PRISMA_MODEL_NAMESPACE = 'prismaModels';

  export const PRISMA_MODEL_TAG = 'prismaModel';

  export const PRISMA_MIDDLEWARE_EXTENSION_POINT = 'prismaMiddleware';
}
