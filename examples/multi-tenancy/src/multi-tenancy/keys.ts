// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {MultiTenancyAction, Tenant} from './types';

export namespace MultiTenancyBindings {
  export const ACTION = BindingKey.create<MultiTenancyAction>(
    'sequence.actions.multi-tenancy',
  );

  export const CURRENT_TENANT = BindingKey.create<Tenant>(
    'multi-tenancy.currentTenant',
  );

  export const STRATEGIES = BindingKey.create<string[]>(
    'multi-tenancy.strategies',
  );
}

export const MULTI_TENANCY_STRATEGIES = 'multi-tenancy.strategies';
