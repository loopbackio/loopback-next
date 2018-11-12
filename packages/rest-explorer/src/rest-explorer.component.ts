// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {Component, CoreBindings} from '@loopback/core';
import {RestApplication, createControllerFactoryForClass} from '@loopback/rest';
import {RestExplorerBindings} from './rest-explorer.keys';
import {RestExplorerConfig} from './rest-explorer.types';
import {ExplorerController} from './rest-explorer.controller';

const swaggerUI = require('swagger-ui-dist');

/**
 * A component providing a self-hosted API Explorer.
 */
export class RestExplorerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
    @inject(RestExplorerBindings.CONFIG, {optional: true})
    config: RestExplorerConfig = {},
  ) {
    const explorerPath = config.path || '/explorer';

    this.registerControllerRoute('get', explorerPath, 'indexRedirect');
    this.registerControllerRoute('get', explorerPath + '/', 'index');

    application.static(explorerPath, swaggerUI.getAbsoluteFSPath());

    // Disable redirect to externally hosted API explorer
    application.restServer.config.apiExplorer = {disabled: true};
  }

  private registerControllerRoute(
    verb: string,
    path: string,
    methodName: string,
  ) {
    this.application.route(
      verb,
      path,
      {
        'x-visibility': 'undocumented',
        responses: {},
      },
      ExplorerController,
      createControllerFactoryForClass(ExplorerController),
      methodName,
    );
  }
}
