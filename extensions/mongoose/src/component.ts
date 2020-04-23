// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  bind,
  Binding,
  BindingScope,
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  LifeCycleObserver,
} from '@loopback/core';
import debugFactory from 'debug';
import {Connection, createConnection, Model} from 'mongoose';
import {MongooseBindings} from './keys';
import {MongooseConfig, MongooseConnectionOptions} from './types';

const debug = debugFactory('loopback:typegoose');

@bind({
  tags: {[ContextTags.KEY]: MongooseBindings.COMPONENT},
  scope: BindingScope.SINGLETON,
})
export class LoopbackMongooseComponent implements Component, LifeCycleObserver {
  mongooseConnections: Connection[] = [];
  bindings: Binding[] = [];

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    protected application: Application,
    @config()
    readonly typegooseConfig: MongooseConfig = [],
  ) {}

  async start() {
    /**
     * You can have multiple connections and you can use schemas on different
     * connections to create connection-model instances.
     */
    let connectionOptions: MongooseConnectionOptions[];

    if (Array.isArray(this.typegooseConfig)) {
      connectionOptions = this.typegooseConfig;
    } else {
      connectionOptions = [this.typegooseConfig];
    }

    for (const connectionIndex in connectionOptions) {
      const connectionConfig = connectionOptions[connectionIndex];
      const connection = await createConnection(
        connectionConfig.uri,
        connectionConfig.connectionOptions,
      );
      // Add the connection to our array.  We don't want to depend on
      // mongoose as a singleton since we could have multiple applications
      // or servers running, and the singleton would disconnect other
      // services
      this.mongooseConnections.push(connection);

      /**
       * First, we turn the base schemas referenced by this connection into
       * models, and bind them to the application context.
       */
      for (const schemaConfig of connectionConfig.schemas ?? []) {
        const model = connection.model(
          schemaConfig.name,
          schemaConfig.schema,
          schemaConfig.collection,
        );
        let binding = schemaConfig.bindingKey;
        if (!binding) {
          if (connectionOptions.length === 1) {
            binding = `loopback-mongoose-extensions.model.${schemaConfig.name}`;
          } else {
            binding = `loopback-mongoose-extensions.connection.${connectionIndex}.model.${schemaConfig.name}`;
          }
        }

        const existing = await this.application.get(binding, {optional: true});
        if (existing) {
          throw new Error(`binding key '${binding}' is already bound`);
        }
        debug(`binding ${binding}`);

        this.application
          .bind(binding)
          .to(model)
          .inScope(BindingScope.SINGLETON);
      }

      /**
       * Now that we have models created, we can creeate any discriminators.
       */
      for (const discriminatorConfig of connectionConfig.discriminators ?? []) {
        const fromModel = (await this.application.get(
          discriminatorConfig.modelKey,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        )) as Model<any>;
        const model = fromModel.discriminator(
          discriminatorConfig.name,
          discriminatorConfig.schema,
          discriminatorConfig.value,
        );

        let binding = discriminatorConfig.bindingKey;

        if (!binding) {
          if (connectionOptions.length === 1) {
            binding = `loopback-mongoose-extensions.model.${discriminatorConfig.name}`;
          } else {
            binding = `loopback-mongoose-extensions.connection.${connectionIndex}.model.${discriminatorConfig.name}`;
          }
        }

        const existing = await this.application.get(binding, {optional: true});
        if (existing) {
          throw new Error(`binding key '${binding}' is already bound`);
        }
        debug(`binding discriminator ${binding}`);
        this.application
          .bind(binding)
          .to(model)
          .inScope(BindingScope.SINGLETON);
      }
    }
  }

  async stop() {
    for (const connection of this.mongooseConnections) {
      await connection.close();
    }
  }
}
