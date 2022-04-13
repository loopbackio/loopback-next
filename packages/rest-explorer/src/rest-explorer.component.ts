// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Component,
  config,
  ContextTags,
  CoreBindings,
  inject,
  injectable,
} from '@loopback/core';
import {createControllerFactoryForClass, RestApplication} from '@loopback/rest';
import {ExplorerController} from './rest-explorer.controller';
import {RestExplorerBindings} from './rest-explorer.keys';
import {RestExplorerConfig} from './rest-explorer.types';

const swaggerUI = require('swagger-ui-dist');

/**
 * A component providing a self-hosted API Explorer.
 */
@injectable({tags: {[ContextTags.KEY]: RestExplorerBindings.COMPONENT.key}})
export class RestExplorerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    private application: RestApplication,
    @config()
    restExplorerConfig: RestExplorerConfig = {},
  ) {
    const explorerPath = restExplorerConfig.path ?? '/explorer';

    this.registerControllerRoute('get', explorerPath, 'indexRedirect');
    this.registerControllerRoute('get', explorerPath + '/', 'index');
    if (restExplorerConfig.useSelfHostedSpec !== false) {
      this.registerControllerRoute(
        'get',
        explorerPath + '/openapi.json',
        'spec',
      );
    }

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
