// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {Middleware} from '@loopback/rest';
import {Tenant} from './types';

export namespace MultiTenancyBindings {
  export const MIDDLEWARE = BindingKey.create<Middleware>(
    'middleware.multi-tenancy',
  );

  export const CURRENT_TENANT = BindingKey.create<Tenant>(
    'multi-tenancy.currentTenant',
  );
}

export const MULTI_TENANCY_STRATEGIES = 'multi-tenancy.strategies';
