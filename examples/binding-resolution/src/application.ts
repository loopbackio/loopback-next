// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import path from 'path';
import {APPLICATION_COUNTER, REQUEST_COUNTER, SERVER_COUNTER} from './keys';
import {SpyMiddlewareProvider} from './middleware/spy.middleware';
import {MySequence} from './sequence';
import {CounterProvider} from './services';

export {ApplicationConfig};

export class BindingDemoApplication extends BootMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    this.middleware(SpyMiddlewareProvider);

    this.bind(APPLICATION_COUNTER)
      .toProvider(CounterProvider)
      .inScope(BindingScope.APPLICATION);
    this.bind(SERVER_COUNTER)
      .toProvider(CounterProvider)
      .inScope(BindingScope.SERVER);
    this.bind(REQUEST_COUNTER)
      .toProvider(CounterProvider)
      .inScope(BindingScope.REQUEST);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
