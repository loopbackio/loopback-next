// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  BindingScope,
  Component,
  config,
  createBindingFromClass,
  inject,
  lifeCycleObserver,
  LifeCycleObserver,
  MixinTarget,
} from '@loopback/core';
import debugFactory from 'debug';
import {Connection, ConnectionManager, ConnectionOptions} from 'typeorm';
import {TypeOrmConnectionBooter} from './';
import {TypeOrmBindings} from './typeorm.keys';

const debug = debugFactory('loopback:typeorm:mixin');

export function TypeOrmMixin<T extends MixinTarget<Application>>(
  superClass: T,
) {
  return class extends superClass {
    connectionManager: ConnectionManager;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this.component(TypeOrmComponent);
      this.connectionManager = new ConnectionManager();
      const binding: Binding<ConnectionManager> = this.bind(
        TypeOrmBindings.MANAGER,
      ).to(this.connectionManager);
      debug('Binding created for connection manager', binding);
    }

    connection(connectionConfig: ConnectionOptions) {
      const connection: Connection =
        this.connectionManager.create(connectionConfig);
      const name = connection.name;
      const binding: Binding<Connection> = this.bind(
        `${TypeOrmBindings.PREFIX}.${name}`,
      )
        .toDynamicValue(() => this.connectionManager.get(name))
        .tag(TypeOrmBindings.TAG);
      this.add(binding);
      return binding;
    }

    async migrateSchema(): Promise<void> {
      // TODO: implement using TypeORM
      throw new Error('TypeORM migration not implemented.');
    }
  };
}

export interface ApplicationUsingTypeOrm extends Application {
  connection(options: ConnectionOptions): void;
  migrateSchema(): Promise<void>;
}

export type TypeOrmComponentOptions = {
  [prop: string]: string;
};

export class TypeOrmComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(TypeOrmConnectionBooter)];
  lifeCycleObservers = [TypeOrmLifeCycleManager];
  constructor(@config() private options: TypeOrmComponentOptions = {}) {}
}

@lifeCycleObserver('datasource', {
  scope: BindingScope.SINGLETON,
})
export class TypeOrmLifeCycleManager implements LifeCycleObserver {
  constructor(
    @inject(TypeOrmBindings.MANAGER)
    private manager: ConnectionManager,
  ) {}

  async start(): Promise<void> {
    await Promise.all(this.manager.connections.map(c => c.connect()));
  }

  async stop(): Promise<void> {
    await Promise.all(this.manager.connections.map(c => c.close()));
  }
}
