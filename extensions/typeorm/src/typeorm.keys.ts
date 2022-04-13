// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey} from '@loopback/core';
import {ConnectionManager} from 'typeorm';

/**
 * Binding keys used by this component.
 */
export namespace TypeOrmBindings {
  export const MANAGER = BindingKey.create<ConnectionManager>(
    'services.TypeOrmConnectionManager',
  );
  export const PREFIX = 'connection';
  export const TAG = 'typeOrmConnection';
}
