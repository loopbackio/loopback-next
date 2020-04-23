// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typeorm
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {LoopbackMongooseComponent, MongooseBindings} from '../../';
import {MySequence} from './MySequence';
import {BindingKeys, Schemas} from './schemas';
import UserController from './user.controller';

export interface TestApplicationConfig extends ApplicationConfig {
  mongoUri?: string;
}

export class TestMongooseApplication extends BootMixin(
  ServiceMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);
    this.configureMongoose(options.mongoUri);
    this.component(LoopbackMongooseComponent);
    this.controller(UserController);

    this.projectRoot = __dirname;
  }

  configureMongoose(uri: string) {
    const schemas = [
      {
        schema: Schemas.Event,
        bindingKey: BindingKeys.Connection1.Event,
        name: 'Event',
      },
      {
        schema: Schemas.User,
        bindingKey: BindingKeys.Connection1.User,
        name: 'User',
      },
    ];
    const discriminators = [
      {
        name: 'LoginEvent',
        schema: Schemas.LoginEvent,
        modelKey: BindingKeys.Connection1.Event,
        bindingKey: BindingKeys.Connection1.LoginEvent,
      },
    ];

    this.configure(MongooseBindings.COMPONENT).to([
      {
        uri,
        connectionOptions: {userNewUrlParser: true},
        schemas,
        discriminators,
      },
    ]);
  }
}
