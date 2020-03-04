// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {TypeOrmConnectionManager} from './services';
import {TypeOrmComponent} from './typeorm.component';

/**
 * Binding keys used by this component.
 */
export namespace TypeOrmBindings {
  export const COMPONENT = BindingKey.create<TypeOrmComponent>(
    'components. TypeOrmComponent',
  );

  export const CONNECTION_MANAGER = BindingKey.create<TypeOrmConnectionManager>(
    'services.TypeOrmConnectionManager',
  );
}

export const CONNECTION_OPTIONS_EXTENSION_POINT = 'typeorm.connectionOptions';
