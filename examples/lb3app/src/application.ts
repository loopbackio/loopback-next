// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {
  OpenAPIObject,
  rebaseOpenApiSpec,
  RestApplication,
} from '@loopback/rest';
import {RestExplorerComponent} from '@loopback/rest-explorer';
import * as path from 'path';
import {MySequence} from './sequence';
import * as debugFactory from 'debug';
import * as pEvent from 'p-event';

const legacyApp = require('../legacy/server/server');
const {generateSwaggerSpec} = require('loopback-swagger');
const swagger2openapi = require('swagger2openapi');

const debug = debugFactory('loopback:example:lb3app');

export class CoffeeShopsApplication extends BootMixin(
  RepositoryMixin(RestApplication),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

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
    debug('LEGACY BOOT');
    if (legacyApp.booting) {
      // Wait until the legacy LB3 app boots
      await pEvent(legacyApp, 'booted');
    }

    debug('MOUNT LB3 APP');
    const swaggerSpec = generateSwaggerSpec(legacyApp);
    const result = await swagger2openapi.convertObj(swaggerSpec, {
      // swagger2openapi options
    });
    const openApiSpec: OpenAPIObject = result.openapi;

    // Option A: mount the entire LB3 app, including any request-preprocessing
    // middleware like CORS, Helmet, loopback#token, etc.

    // 1. Rebase the spec, e.g. from `GET /Products` to `GET /api/Products`.
    const specInRoot = rebaseOpenApiSpec(openApiSpec, swaggerSpec.basePath);
    if (debug.enabled)
      debug(
        'API of LB3 app',
        Object.keys(specInRoot.paths)
          .map(p =>
            Object.keys(specInRoot.paths[p])
              .map(v => `\n\t${v.toUpperCase()} ${p}`)
              .join(''),
          )
          .join(''),
      );

    // 2. Mount the full Express app
    this.mountExpressRouter('/', specInRoot, legacyApp);

    /* Options B: mount LB3 REST handler only.
     * Important! This does not mount `loopback#token` middleware!

    this.mountExpressRouter(
      '/api', // we can use any value here,
              // no need to call legacyApp.get('restApiRoot')
      openApiSpec,
      // TODO(bajtos) reload the handler when a model/method was added/removed
      legacyApp.handler('rest')
    );
      */

    // TODO(bajtos) Listen for the following events to update the OpenAPI spec:
    // - modelRemoted
    // - modelDeleted
    // - remoteMethodAdded
    // - remoteMethodDisabled
    // Note: LB4 does not support live spec updates yet.

    debug('LB4 BOOT');
    // Boot the new LB4 layer now
    await super.boot();

    debug('BOOTED');
  }
}
