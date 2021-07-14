// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ValueOrPromise} from '@loopback/core';
import {RequestContext} from '@loopback/rest';
import {Tenant} from '../types';

export abstract class BaseStrategy {
  bindResources(
    requestContext: RequestContext,
    tenant: Tenant,
  ): ValueOrPromise<void> {
    requestContext
      .bind('datasources.db')
      .toAlias(`datasources.db.${tenant.id}`);
  }
}
