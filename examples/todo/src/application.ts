// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, Constructor, Provider} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {MySequence} from './sequence';
import {GeocoderServiceProvider} from './services';

export class TodoListApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

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

    // TODO(bajtos) Services should be created and registered by @loopback/boot
    // See https://github.com/strongloop/loopback-next/issues/1439
    this.setupServices();
  }

  setupServices() {
    this.service(GeocoderServiceProvider);
  }

  // TODO(bajtos) app.service should be provided either by core Application
  // class or a mixin provided by @loopback/service-proxy
  // See https://github.com/strongloop/loopback-next/issues/1439
  service<T>(provider: Constructor<Provider<T>>) {
    const key = `services.${provider.name.replace(/Provider$/, '')}`;
    this.bind(key).toProvider(provider);
  }
}
