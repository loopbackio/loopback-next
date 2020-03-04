// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BindingScope,
  config,
  ContextTags,
  extensions,
  Getter,
  LifeCycleObserver,
  lifeCycleObserver,
} from '@loopback/core';
import {ConnectionManager, ConnectionOptions} from 'typeorm';
import {CONNECTION_OPTIONS_EXTENSION_POINT, TypeOrmBindings} from '../keys';
import {TypeOrmConfig} from '../types';

@lifeCycleObserver('datasource', {
  tags: {[ContextTags.KEY]: TypeOrmBindings.CONNECTION_MANAGER},
  scope: BindingScope.SINGLETON,
})
export class TypeOrmConnectionManager implements LifeCycleObserver {
  readonly connectionManager = new ConnectionManager();

  /**
   * Allow connection options to be contributed via `typeorm.connectionOptions`
   * extension point
   */
  @extensions(CONNECTION_OPTIONS_EXTENSION_POINT)
  readonly getConnectionOptions: Getter<ConnectionOptions[]>;

  constructor(
    @config({fromBinding: TypeOrmBindings.COMPONENT})
    readonly typeOrmConfig: TypeOrmConfig,
  ) {}

  async start() {
    let configs: ConnectionOptions[];
    if (!Array.isArray(this.typeOrmConfig) && this.typeOrmConfig != null) {
      configs = [this.typeOrmConfig];
    } else {
      configs = this.typeOrmConfig;
    }
    configs = configs ?? [];
    const connectionOptions = await this.getConnectionOptions();
    configs = configs.concat(connectionOptions);
    for (const c of configs) {
      const connection = this.connectionManager.create(c);
      await connection.connect();
    }
  }

  async stop() {
    for (const connection of this.connectionManager.connections) {
      await connection.close();
    }
  }
}
