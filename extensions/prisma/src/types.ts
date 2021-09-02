// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/prisma
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TagMap} from '@loopback/core';
import {AnyObject, KeyOf} from '@loopback/repository';
import {Prisma} from '@prisma/client';
import {PrismaBindings} from './keys';

/**
 * @defaultValue {@link DEFAULT_PRISMA_BINDING_CREATION_OPTIONS}
 */
export type BindingFromPrismaModelNameOptions = {
  namespace?: string;
  tags?: string[] | TagMap;
};

/**
 * The default configuration values used by
 * {@link createBindingFromPrismaModelName}.
 */
export const DEFAULT_PRISMA_BINDING_CREATION_OPTIONS = {
  namespace: PrismaBindings.PRISMA_MODEL_NAMESPACE,
  tags: [PrismaBindings.PRISMA_MODEL_TAG],
};

/**
 * Interface defining the options accepted by
 * {@link ./component/PrismaComponent}.
 *
 * @remarks
 * It accepts all values of {@link Prisma.PrismaClientOptions} along with some
 * additional configuration.
 *
 * ## lazyConnect
 * The `lazyConnect` option emulates the
 * behaviour of LoopBack 4-native connectors to only establish a connection upon
 * the first database request.
 *
 * Setting `lazyConnect: true` will prevent the explicit calling of
 * `PrismaClient.$connect()`, and instead fallback to Prisma's default
 * behaviour.
 *
 * ## Logging Integration
 * `enableLoggingIntegration: true` will set PrismaClient to output all logs as
 * events. Note that the Prisma Client log options cannot be manually set with
 * this value.
 *
 * Also see: [Existing PrismaClient](#Existing-PrismaClient).
 *
 * ## Existing PrismaClient
 * If an existing PrismaClient is bound before datasource lifecycle
 * initialisation, all any under `prismaClient` will cause an error to be
 * thrown.
 *
 * @defaultValue {@link DEFAULT_PRISMA_COMPONENT_OPTIONS}
 */
export type PrismaOptions =
  | {
      enableLoggingIntegration?: false | undefined;
      lazyConnect?: boolean;
      models?: BindingFromPrismaModelNameOptions;
      prismaClient?: Prisma.PrismaClientOptions;
    }
  | {
      enableLoggingIntegration: true;
      lazyConnect?: boolean;
      models?: BindingFromPrismaModelNameOptions;
      prismaClient?: Omit<Prisma.PrismaClientOptions, 'log'> & {log: undefined};
    };

/**
 * The default options used by
 * {@link ./component/PrismaComponent | PrismaComponent}.
 */
export const DEFAULT_PRISMA_OPTIONS: PrismaOptions = {
  enableLoggingIntegration: false,
  lazyConnect: false,
  models: DEFAULT_PRISMA_BINDING_CREATION_OPTIONS,
};

export type Filter<MT extends object = AnyObject> =
  | {
      select?: SelectFilter<MT>;
      orderBy?: OrderByFilter;
      skip?: SkipFilter;
      take?: TakeFilter;
      where?: WhereFilter<MT>;
    }
  | {
      include?: IncludeFilter<MT>;
      orderBy?: OrderByFilter;
      skip?: SkipFilter;
      take?: TakeFilter;
      where?: WhereFilter;
    };

export type WhereFilter<MT extends object = AnyObject> = AndClause<MT> &
  OrClause<MT> &
  Condition<MT>;

export type Condition<MT extends object = AnyObject> = Omit<
  {
    [prop in KeyOf<MT>]: {
      equals?: string;
    };
  },
  'AND' | 'OR'
>;

export type AndClause<MT extends object = AnyObject> = {
  AND?: WhereFilter<MT>[];
};

export type OrClause<MT extends object = AnyObject> = {
  OR?: WhereFilter<MT>[];
};

export type SelectFilter<MT extends object = AnyObject> = Record<
  KeyOf<MT>,
  boolean
>;
export type IncludeFilter<MT extends object = AnyObject> = Record<
  KeyOf<MT>,
  Filter | boolean
>;
export type OrderByFilter = Record<string, 'asc' | 'desc'>;
export type SkipFilter = number;
export type TakeFilter = number;
