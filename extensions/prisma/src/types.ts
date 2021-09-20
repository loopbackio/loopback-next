// Copyright The LoopBack Authors 2021. All Rights Reserved.
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

export type AggregateFilter<MT extends object = AnyObject> = Omit<
  Filter,
  'select'
> & {
  _avg?: {
    [prop in KeyOf<MT>]?: MT[prop] extends number ? boolean : never;
  };
  _sum?: {
    [prop in KeyOf<MT>]?: MT[prop] extends number ? boolean : never;
  };
  _min?: {
    [prop in KeyOf<MT>]?: MT[prop] extends number ? boolean : never;
  };
  _max?: {
    [prop in KeyOf<MT>]?: MT[prop] extends number ? boolean : never;
  };
};

export type GroupByFilter<MT extends object = AnyObject> = AggregateFilter & {
  orderBy: (keyof MT)[];
  by: (keyof MT)[];
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

export type WhereFilter<MT extends object = AnyObject> =
  | (AndClause<MT> & OrClause<MT> & NotClause<MT>)
  | Condition<MT>;

export type Condition<MT extends object = AnyObject> = Omit<
  {
    [prop in KeyOf<MT>]:
      | MT[prop]
      | {
          equals?: MT[prop];
          not?: MT[prop];
          in?: Array<MT[prop]>;
          notIn?: Array<MT[prop]>;
          lt?: MT[prop] extends number | Date ? MT[prop] : never;
          lte?: MT[prop] extends number | Date ? MT[prop] : never;
          gt?: MT[prop] extends number | Date ? MT[prop] : never;
          gte?: MT[prop] extends number | Date ? MT[prop] : never;
          contains?: MT[prop];
          search?: string;
          mode?: string;
          startsWith?: string;
          endsWith?: string;

          every?: MT[prop] | null;
          some?: MT[prop] | null;
          none?: MT[prop] | null;
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

export type NotClause<MT extends object = AnyObject> = {
  NOT?: Condition<MT>;
};

export type SelectFilter<MT extends object = AnyObject> = Record<
  KeyOf<MT>,
  boolean
> & {
  _count?: boolean;
};

export type IncludeFilter<MT extends object = AnyObject> = Record<
  KeyOf<MT>,
  Filter | boolean
>;
export type OrderByFilter =
  | Record<string, 'asc' | 'desc'>
  | Record<string, 'asc' | 'desc'>[];
export type SkipFilter = number;
export type TakeFilter = number;
