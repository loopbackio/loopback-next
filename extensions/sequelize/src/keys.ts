// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, CoreBindings} from '@loopback/core';
import {LoopbackSequelizeComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace LoopbackSequelizeComponentBindings {
  export const COMPONENT = BindingKey.create<LoopbackSequelizeComponent>(
    `${CoreBindings.COMPONENTS}.LoopbackSequelizeComponent`,
  );
}
