// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Component, CoreBindings} from '@loopback/core';
import {inject} from '@loopback/context';
import {RestApplication, RestBindings, Request, Response} from './';
import {get} from '@loopback/openapi-v3';
const swaggerUI = require('swagger-ui-dist');
const path = require('path');
const readFileSync = require('fs').readFileSync;
const writeFileSync = require('fs').writeFileSync;

export class ExplorerComponent implements Component {
  controllers = [ExplorerController];

  constructor(@inject(CoreBindings.APPLICATION_INSTANCE) app: RestApplication) {
    if (app.config.enableExplorer) {
      //console.log('COMPONENT INIT');
      const openApiSpecUrl = app.config.openApiSpecUrl || '/openapi.json';
      const explorerPath = app.config.explorerPath || '/explorer';
      const explorerLocalPath = swaggerUI.getAbsoluteFSPath();
      // const explorerIndexFilePath = path.join(explorerLocalPath, 'index.html');
      // const templateFilePath = path.join(__dirname, 'index.html.tpl');
      // const templateContent = readFileSync(templateFilePath, 'utf8').replace(
      //   '<%- openApiSpecUrl %>',
      //   openApiSpecUrl,
      // );
      // writeFileSync(explorerIndexFilePath, templateContent);
      app.static(explorerPath, explorerLocalPath);
    }
  }
}

export class ExplorerController {
  constructor(
    @inject(RestBindings.Http.REQUEST) private req: Request,
    @inject(RestBindings.Http.RESPONSE) private res: Response,
  ) {
    //console.log('CONTROLLER CALLED');
  }

  // Map to `GET /ping`
  @get('/explorer1', {responses: {}})
  index(): string {
    //console.log('>>>> HERE');
    return '<b>ajajaj</b>';
  }
}
