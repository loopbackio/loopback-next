// Copyright IBM Corp. 2021. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {PrismaBindings, PrismaComponent, PrismaOptions} from '@loopback/prisma';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import path from 'path';
import {MySequence} from './sequence';

export {ApplicationConfig};

export class PrismaApplication extends BootMixin(RestApplication) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    //
    // PRISMA CONFIGURATION START
    //

    // Note: This can be done at any point in the Application constructor.

    // This will auto-magically import and instantiate our generated
    // PrismaClient during `.init()`.
    this.component(PrismaComponent);

    // Configure Prisma Options (Optional)
    this.configure<PrismaOptions>(PrismaBindings.COMPONENT).to({
      lazyConnect: true,
      // Passthrough Prisma Client options
      prismaClient: {
        errorFormat: 'pretty',
      },
    });

    //
    // PRISMA CONFIGURATION END
    //

    // Set up the custom sequence
    this.sequence(MySequence);

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
