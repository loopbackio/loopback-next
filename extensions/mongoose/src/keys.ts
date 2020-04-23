// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/mongoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {LoopbackMongooseComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace MongooseBindings {
  export const COMPONENT = BindingKey.create<LoopbackMongooseComponent>(
    'components.LoopbackMongooseComponent',
  );
}
