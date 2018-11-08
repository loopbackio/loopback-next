// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, CoreBindings} from '@loopback/core';
import {inject} from '@loopback/context';
import {RestApplication} from '.';
const swaggerUI = require('swagger-ui-dist');

export class ExplorerComponent implements Component {
  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: RestApplication) {
    if (app.config.apiExplorer) {
      const explorerPath = app.config.apiExplorer.explorerPath || '/explorer';
      app.config.apiExplorer.url = explorerPath;
      app.config.apiExplorer.httpUrl = explorerPath;
      const explorerLocalPath = swaggerUI.getAbsoluteFSPath();
      app.static(explorerPath, explorerLocalPath);
    }
  }
}
