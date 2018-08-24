import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, Constructor, Provider} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {MySequence} from './sequence';
import {CalculatorServiceProvider} from './services/calculator.service';

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
