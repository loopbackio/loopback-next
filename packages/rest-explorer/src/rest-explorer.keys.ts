// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingAddress, BindingKey} from '@loopback/core';
import {RestExplorerComponent} from './rest-explorer.component';
import {RestExplorerConfig} from './rest-explorer.types';

/**
 * Binding keys used by this component.
 */
export namespace RestExplorerBindings {
  /**
   * Binding key for RestExplorerComponent
   */
  export const COMPONENT = BindingKey.create<RestExplorerComponent>(
    'components.RestExplorerComponent',
  );
  /**
   * Binding key for configuration of RestExplorerComponent.
   *
   * We recommend `ctx.configure(RestExplorerBindings.COMPONENT)` to be used
   * instead of `ctx.bind(RestExplorerBindings.CONFIG)`.
   */
  export const CONFIG: BindingAddress<RestExplorerConfig> =
    BindingKey.buildKeyForConfig<RestExplorerConfig>(COMPONENT);
}
