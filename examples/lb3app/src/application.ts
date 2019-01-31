// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication, OpenAPIObject, OperationObject} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import * as path from 'path';
import {promisify} from 'util';
import {MySequence} from './sequence';

const legacyApp = require('../../legacy/server/server');
const legacyBoot = promisify(require('loopback-boot'));
const {generateSwaggerSpec} = require('loopback-swagger');
const swagger2openapi = require('swagger2openapi');

export class TodoListApplication extends BootMixin(
  RepositoryMixin(RestApplication),
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
    };
  }

  async boot() {
    // Boot the legacy LB3 app first
    await legacyBoot(legacyApp);

    const swaggerSpec = generateSwaggerSpec(legacyApp);
    const result = await swagger2openapi.convertObj(swaggerSpec, {
      // swagger2openapi options
    });

    const openApiSpec: OpenAPIObject = result.openapi;
    for (const p in openApiSpec.paths) {
      for (const v in openApiSpec.paths[p]) {
        const spec: OperationObject = openApiSpec.paths[p][v];
        if (!spec.responses) {
          // not an operation object
          // paths can have extra properties, e.g. "parameters"
          // in addition to operations mapped to HTTP verbs
          continue;
        }
        spec['x-operation'] = function noop() {
          const msg =
            `The endpoint "${v} ${p}" is a LoopBack v3 route ` +
            'handled by the compatibility layer.';
          return Promise.reject(new Error(msg));
        };
      }
    }

    this.api(openApiSpec);

    // Boot the actual LB4 app second
    return super.boot();
  }
}
