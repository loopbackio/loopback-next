// Copyright LoopBack contributors 2022. All Rights Reserved.
// Node module: @loopback/sequelize
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {LoopbackSequelizeComponentBindings} from './keys';
import {
  DEFAULT_LOOPBACK_SEQUELIZE_OPTIONS,
  LoopbackSequelizeComponentOptions,
} from './types';

// Configure the binding for LoopbackSequelizeComponent
@injectable({
  tags: {
    [ContextTags.KEY]: LoopbackSequelizeComponentBindings.COMPONENT,
  },
})
export class LoopbackSequelizeComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: Application,
    @config()
    private options: LoopbackSequelizeComponentOptions = DEFAULT_LOOPBACK_SEQUELIZE_OPTIONS,
  ) {}
}
