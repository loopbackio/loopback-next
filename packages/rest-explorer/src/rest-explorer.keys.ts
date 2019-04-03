// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/context';
import {RestExplorerConfig} from './rest-explorer.types';

/**
 * Binding keys used by this component.
 */
export namespace RestExplorerBindings {
  export const CONFIG = BindingKey.create<RestExplorerConfig>(
    'rest-explorer.config',
  );
}
