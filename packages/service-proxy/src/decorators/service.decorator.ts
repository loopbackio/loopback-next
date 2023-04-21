// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/service-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  inject,
  Injection,
  InjectionMetadata,
  MetadataAccessor,
} from '@loopback/core';
import {getService, juggler} from '..';

/**
 * Type definition for decorators returned by `@serviceProxy` decorator factory
 */
export type ServiceProxyDecorator = PropertyDecorator | ParameterDecorator;

export const SERVICE_PROXY_KEY = MetadataAccessor.create<
  string,
  ServiceProxyDecorator
>('service.proxy');

/**
 * Metadata for a service proxy
 */
export class ServiceProxyMetadata implements InjectionMetadata {
  decorator = '@serviceProxy';
  dataSourceName?: string;
  dataSource?: juggler.DataSource;

  constructor(dataSource: string | juggler.DataSource) {
    if (typeof dataSource === 'string') {
      this.dataSourceName = dataSource;
    } else {
      this.dataSource = dataSource;
    }
  }
}

export function serviceProxy(dataSource: string | juggler.DataSource) {
  return function (
    target: object,
    key: string | undefined,
    parameterIndex?: number,
  ) {
    if (key || typeof parameterIndex === 'number') {
      const meta = new ServiceProxyMetadata(dataSource);
      inject('', meta, resolve)(target, key, parameterIndex);
    } else {
      throw new Error(
        '@serviceProxy can only be applied to properties or method parameters',
      );
    }
  };
}

/**
 * Resolve the @repository injection
 * @param ctx - Context
 * @param injection - Injection metadata
 */
async function resolve(ctx: Context, injection: Injection) {
  const meta = injection.metadata as ServiceProxyMetadata;
  if (meta.dataSource) return getService(meta.dataSource);
  if (meta.dataSourceName) {
    const ds = await ctx.get<juggler.DataSource>(
      'datasources.' + meta.dataSourceName,
    );
    return getService(ds);
  }
  throw new Error(
    '@serviceProxy must provide a name or an instance of DataSource',
  );
}
