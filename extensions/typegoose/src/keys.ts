// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {LoopbackTypegooseComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace TypegooseBindings {
  export const COMPONENT = BindingKey.create<LoopbackTypegooseComponent>(
    'components.LoopbackTypegooseComponent',
  );
}
