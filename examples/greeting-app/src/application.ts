// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/example-greeting-app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {GreetingComponent} from '@loopback/example-greeter-extension';
import {RestApplication} from '@loopback/rest';
import {CachingService} from './caching-service';
import {CachingInterceptor} from './interceptors';
import {CACHING_SERVICE} from './keys';

export class GreetingApplication extends BootMixin(RestApplication) {
  constructor(config: ApplicationConfig = {}) {
    super(config);
    this.projectRoot = __dirname;
    this.add(createBindingFromClass(CachingService, {key: CACHING_SERVICE}));
    this.add(createBindingFromClass(CachingInterceptor));
    this.component(GreetingComponent);
  }

  async main() {
    await this.boot();
    await this.start();
  }
}
