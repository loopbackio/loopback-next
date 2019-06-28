// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {RestExplorerComponent} from './rest-explorer.component';
import {RestExplorerConfig} from './rest-explorer.types';

/**
 * Binding keys used by this component.
 */
export namespace RestExplorerBindings {
  export const COMPONENT = BindingKey.create<RestExplorerComponent>(
    'components.RestExplorerComponent',
  );
  export const CONFIG = BindingKey.buildKeyForConfig<RestExplorerConfig>(
    COMPONENT,
  );
}
