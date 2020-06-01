// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/context-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {ContextExplorerComponent} from './context-explorer.component';

/**
 * Binding keys used by this component.
 */
export namespace ContextExplorerBindings {
  /**
   * Binding key for ContextExplorerComponent
   */
  export const COMPONENT = BindingKey.create<ContextExplorerComponent>(
    'components.ContextExplorerComponent',
  );
}
