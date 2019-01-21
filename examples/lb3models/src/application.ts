// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-lb3models
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import {CompatMixin} from '@loopback/v3compat';
import * as path from 'path';
import {MySequence} from './sequence';

export class TodoListApplication extends CompatMixin(
  BootMixin(ServiceMixin(RepositoryMixin(RestApplication))),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../../public'));

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

      v3compat: {
        // from "/dist/src/application.ts" to "/legacy"
        root: '../../legacy',
      },
    };

    this.v3compat.dataSource('mysqlDs', {
      name: 'mysqlDs',
      connector: require('loopback-connector-mysql'),
      host: 'demo.strongloop.com',
      port: 3306,
      database: 'getting_started',
      username: 'demo',
      password: 'L00pBack',
    });
  }
}
