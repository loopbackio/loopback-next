// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/context-explorer
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
import {RestApplication} from '@loopback/rest';
import path from 'path';
import {contextExplorerControllerFactory} from './context-explorer.controller';
import {ContextExplorerBindings} from './keys';
import {ContextExplorerConfig} from './types';

/**
 * A component providing a self-hosted API Explorer.
 */
@injectable({tags: {[ContextTags.KEY]: ContextExplorerBindings.COMPONENT.key}})
export class ContextExplorerComponent implements Component {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    application: RestApplication,
    @config()
    explorerConfig: ContextExplorerConfig = {},
  ) {
    const explorerPath = explorerConfig.path ?? '/context-explorer';
    if (explorerConfig.enableD3Animation !== false) {
      application.static(explorerPath, path.join(__dirname, '../public'));
    }

    application.controller(contextExplorerControllerFactory(explorerPath));
  }
}
