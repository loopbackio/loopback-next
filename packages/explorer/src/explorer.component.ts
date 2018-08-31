// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {Application, Component, CoreBindings} from '@loopback/core';
import {RestServer} from '@loopback/rest';
import {ApiExplorerUIOptions, apiExplorerUI} from './explorer';
import {ExplorerBindings} from './keys';

/**
 * We have a few options:
 *
 * 1. The Explorer component contributes an express middleware so that REST
 * servers can mount the UI
 *
 * 2. The Explorer component contributes a route to REST servers
 *
 * 3. The Explorer component proactively mount itself with the RestApplication
 */
export class ExplorerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) private application: Application,
    @inject(ExplorerBindings.CONFIG, {optional: true})
    private config: ApiExplorerUIOptions,
  ) {
    this.init();
  }

  init() {
    // FIXME: We should be able to receive the servers via injection
    const restServerBindings = this.application.find(
      binding =>
        binding.key.startsWith(CoreBindings.SERVERS) &&
        binding.valueConstructor === RestServer,
    );
    for (const binding of restServerBindings) {
      const restServer = this.application.getSync<RestServer>(binding.key);
      restServer.bind(ExplorerBindings.MIDDLEWARE).to({
        path: this.config.path || '/explorer',
        handler: apiExplorerUI(this.config),
      });
    }
  }
}
