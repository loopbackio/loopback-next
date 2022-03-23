import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import path from 'path';

export class CacheApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

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
