// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/booter-lb3app
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BootBindings, Booter} from '@loopback/boot';
import {CoreBindings, inject} from '@loopback/core';
import {
  ExpressRequestHandler,
  OpenApiSpec,
  rebaseOpenApiSpec,
  RestApplication,
} from '@loopback/rest';
import * as debugFactory from 'debug';
import {Application as ExpressApplication} from 'express';
import pEvent from 'p-event';
import * as path from 'path';

const {generateSwaggerSpec} = require('loopback-swagger');
const swagger2openapi = require('swagger2openapi');

const debug = debugFactory('loopback:boot:lb3app');

const DefaultOptions: Lb3AppBooterOptions = {
  // from "/dist/application.ts" to "/lb3app"
  path: '../lb3app/server/server',
  mode: 'fullApp',
  restApiRoot: '/api',
};

export class Lb3AppBooter implements Booter {
  options: Lb3AppBooterOptions;
  appPath: string;

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: RestApplication,
    @inject(BootBindings.PROJECT_ROOT)
    public projectRoot: string,
    @inject(`${BootBindings.BOOT_OPTIONS}#lb3app`)
    options: Partial<Lb3AppBooterOptions> = {},
  ) {
    this.options = Object.assign({}, DefaultOptions, options);

    if (typeof app.mountExpressRouter !== 'function') {
      throw new Error(
        'Lb3AppBooter requires RestApplication with mountExpressRouter API',
      );
    }
  }

  async configure?(): Promise<void> {
    this.appPath = path.join(this.projectRoot, this.options.path);
  }

  async load?(): Promise<void> {
    const lb3App = await this.loadAndBootTheApp();
    const spec = await this.buildOpenApiSpec(lb3App);
    if (this.options.mode === 'fullApp') {
      this.mountFullApp(lb3App, spec);
    } else {
      this.mountRoutesOnly(lb3App, spec);
    }

    // TODO(bajtos) Listen for the following events to update the OpenAPI spec:
    // - modelRemoted
    // - modelDeleted
    // - remoteMethodAdded
    // - remoteMethodDisabled
    // Note: LB4 does not support live spec updates yet. See
    // https://github.com/strongloop/loopback-next/issues/2394 for details.
  }

  private async loadAndBootTheApp() {
    debug('Loading LB3 app from', this.appPath);
    const lb3App = require(this.appPath);

    if (lb3App.booting) {
      debug('  waiting for boot process to finish');
      // Wait until the legacy LB3 app boots
      await pEvent(lb3App, 'booted');
    }

    return lb3App as Lb3Application;
  }

  private async buildOpenApiSpec(lb3App: Lb3Application) {
    const swaggerSpec = generateSwaggerSpec(lb3App, {
      generateOperationScopedModels: true,
    });
    const result = await swagger2openapi.convertObj(swaggerSpec, {
      // swagger2openapi options
    });
    return result.openapi as OpenApiSpec;
  }

  private mountFullApp(lb3App: Lb3Application, spec: OpenApiSpec) {
    const restApiRoot = lb3App.get('restApiRoot') || '/';
    debug('Mounting the entire LB3 app at %s', restApiRoot);
    const specInRoot = rebaseOpenApiSpec(spec, restApiRoot);
    this.app.mountExpressRouter('/', lb3App, specInRoot);
  }

  private mountRoutesOnly(lb3App: Lb3Application, spec: OpenApiSpec) {
    const restApiRoot = this.options.restApiRoot;
    debug('Mounting LB3 REST router at %s', restApiRoot);
    this.app.mountExpressRouter(
      restApiRoot,
      // TODO(bajtos) reload the handler when a model/method was added/removed
      // See https://github.com/strongloop/loopback-next/issues/2394 for details.
      lb3App.handler('rest'),
      spec,
    );
  }
}

export interface Lb3AppBooterOptions {
  path: string;
  mode: 'fullApp' | 'restRouter';
  restApiRoot: string;
}

interface Lb3Application extends ExpressApplication {
  handler(name: 'rest'): ExpressRequestHandler;
}
