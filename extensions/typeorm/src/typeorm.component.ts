// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Component,
  ContextTags,
  createBindingFromClass,
} from '@loopback/core';
import {TypeOrmBindings} from './keys';
import {TypeOrmConnectionManager} from './services';

@bind({
  tags: {[ContextTags.KEY]: TypeOrmBindings.COMPONENT},
})
export class TypeOrmComponent implements Component {
  bindings = [createBindingFromClass(TypeOrmConnectionManager)];
}
