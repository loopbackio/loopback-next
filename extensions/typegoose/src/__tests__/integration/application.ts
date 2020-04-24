// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/typegoose
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import debugFactory from 'debug';
import {LoopbackTypegooseComponent} from '../../component';
import {MySequence} from './MySequence';
import {configureTypegoose} from './schemas';
import UserController from './user.controller';

const debug = debugFactory('loopback:typegoose:integration-test');
export interface TestApplicationConfig extends ApplicationConfig {
  mongoUri?: string;
}

export class TestTypegooseApplication extends BootMixin(
  ServiceMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    this.sequence(MySequence);
    this.controller(UserController);
    this.projectRoot = __dirname;
  }

  async start() {
    debug('TestApplicationConfig:start()');
    await configureTypegoose(this, this.options.mongoUri);
    this.component(LoopbackTypegooseComponent);
    await super.start();
  }
}
