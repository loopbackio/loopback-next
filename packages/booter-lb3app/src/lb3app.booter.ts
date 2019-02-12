// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/v3compat
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
import * as pEvent from 'p-event';
import * as path from 'path';

const {generateSwaggerSpec} = require('loopback-swagger');
const swagger2openapi = require('swagger2openapi');

const debug = debugFactory('loopback:boot:lb3app');

const DefaultOptions: Lb3AppBooterOptions = {
  // from "/dist/application.ts" to "/legacy"
  path: '../legacy/server/server',
  mode: 'full',
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
    const legacyApp = await this.loadAndBootTheApp();
    const spec = await this.buildOpenApiSpec(legacyApp);
    if (this.options.mode === 'full') {
      this.mountFullApp(legacyApp, spec);
    } else {
      this.mountRoutesOnly(legacyApp, spec);
    }

    // TODO(bajtos) Listen for the following events to update the OpenAPI spec:
    // - modelRemoted
    // - modelDeleted
    // - remoteMethodAdded
    // - remoteMethodDisabled
    // Note: LB4 does not support live spec updates yet.
  }

  private async loadAndBootTheApp() {
    debug('Loading LB3 app from', this.appPath);
    const legacyApp = require(this.appPath);

    // NOTE(bajtos) loopback-boot@3 sets "booting" flag asynchronously,
    // it can have one of the following values:
    // - undefined: boot has not started yet or is in (early) progress
    // - true: boot is in progress
    // - false: boot was finished
    if (legacyApp.booting !== false) {
      debug('  waiting for boot process to finish');
      // Wait until the legacy LB3 app boots
      await pEvent(legacyApp, 'booted');
    }

    return legacyApp as Lb3Application;
  }

  private async buildOpenApiSpec(legacyApp: Lb3Application) {
    const swaggerSpec = generateSwaggerSpec(legacyApp);
    const result = await swagger2openapi.convertObj(swaggerSpec, {
      // swagger2openapi options
    });
    return result.openapi as OpenApiSpec;
  }

  private mountFullApp(legacyApp: Lb3Application, spec: OpenApiSpec) {
    const restApiRoot = legacyApp.get('restApiRoot') || '/';
    debug('Mounting the entire LB3 app at %s', restApiRoot);
    const specInRoot = rebaseOpenApiSpec(spec, restApiRoot);
    this.app.mountExpressRouter('/', legacyApp, specInRoot);
  }

  private mountRoutesOnly(legacyApp: Lb3Application, spec: OpenApiSpec) {
    // TODO(bajtos) make this configurable
    const restApiRoot = '/api';
    debug('Mounting LB3 REST router at %s', restApiRoot);
    this.app.mountExpressRouter(
      restApiRoot,
      // TODO(bajtos) reload the handler when a model/method was added/removed
      legacyApp.handler('rest'),
      spec,
    );
  }
}

export interface Lb3AppBooterOptions {
  path: string;
  mode: 'full' | 'router';
}

interface Lb3Application extends ExpressApplication {
  handler(name: 'rest'): ExpressRequestHandler;
}
