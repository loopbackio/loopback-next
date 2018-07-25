import {ApplicationConfig, Constructor, Provider} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {MySequence} from './sequence';
import {CalculatorServiceProvider} from './services/calculator.service';

// Binding and Booter imports are required to infer types for BootMixin!
/* tslint:disable:no-unused-variable */
import {BootMixin, Booter, Binding} from '@loopback/boot';

// juggler imports are required to infer types for RepositoryMixin!
import {
  Class,
  Repository,
  RepositoryMixin,
  juggler,
} from '@loopback/repository';
/* tslint:enable:no-unused-variable */

export class SoapCalculatorApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options?: ApplicationConfig) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    //bind services
    this.setupServices();

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

  setupServices() {
    this.service(CalculatorServiceProvider);
  }

  service<T>(provider: Constructor<Provider<T>>) {
    const key = `services.${provider.name.replace(/Provider$/, '')}`;
    this.bind(key).toProvider(provider);
  }
}
