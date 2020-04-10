// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, createBindingFromClass, extensionFor} from '@loopback/core';
import {MultiTenancyActionProvider} from './actions/multi-tenancy-action.provider';
import {MultiTenancyBindings, MULTI_TENANCY_STRATEGIES} from './keys';
import {
  HeaderStrategy,
  HostStrategy,
  JWTStrategy,
  QueryStrategy,
} from './strategies';

export class MultiTenancyComponent implements Component {
  bindings = [
    createBindingFromClass(MultiTenancyActionProvider, {
      key: MultiTenancyBindings.ACTION,
    }),
    createBindingFromClass(JWTStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(HeaderStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(QueryStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
    createBindingFromClass(HostStrategy).apply(
      extensionFor(MULTI_TENANCY_STRATEGIES),
    ),
  ];
}
