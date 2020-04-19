// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {LoopbackTypegooseComponent} from '../../component';
import {TypegooseBindings} from '../../keys';
import {MySequence} from './MySequence';
import {BindingKeys, Schemas} from './schemas';
import UserController from './user.controller';

export interface TestApplicationConfig extends ApplicationConfig {
  mongoUri?: string;
}

export class TestTypegooseApplication extends BootMixin(
  ServiceMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    this.sequence(MySequence);
    this.configureTypegoose(options.mongoUri);
    this.component(LoopbackTypegooseComponent);
    this.controller(UserController);

    this.projectRoot = __dirname;
  }

  configureTypegoose(uri: string) {
    const schemas = [
      {schema: Schemas.Event, bindingKey: BindingKeys.Connection1.Event},
      {schema: Schemas.User, bindingKey: BindingKeys.Connection1.User},
    ];
    const discriminators = [
      {
        schema: Schemas.LoginEvent,
        modelKey: BindingKeys.Connection1.Event,
        bindingKey: BindingKeys.Connection1.LoginEvent,
      },
    ];

    this.configure(TypegooseBindings.COMPONENT).to([
      {
        uri,
        connectionOptions: {userNewUrlParser: true},
        schemas,
        discriminators,
      },
    ]);
  }
}
