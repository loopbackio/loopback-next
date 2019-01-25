// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  RestBindings,
  RestServerConfig,
  OpenApiSpecForm,
  Request,
  Response,
} from '@loopback/rest';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// TODO(bajtos) Allow users to customize the template
const indexHtml = path.resolve(__dirname, '../../templates/index.html.ejs');
const template = fs.readFileSync(indexHtml, 'utf-8');
const templateFn = ejs.compile(template);

export class ExplorerController {
  private serverRootPath: string;
  private openApiSpecUrl: string;

  constructor(
    @inject(RestBindings.CONFIG, {optional: true})
    restConfig: RestServerConfig = {},
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    this.serverRootPath = this.getServerRootPath(restConfig);
    this.openApiSpecUrl = this.getOpenApiSpecUrl(restConfig);
  }

  indexRedirect() {
    this.response.redirect(301, this.serverRootPath + this.request.url + '/');
  }

  index() {
    const data = {
      openApiSpecUrl: this.openApiSpecUrl,
    };

    const homePage = templateFn(data);
    this.response
      .status(200)
      .contentType('text/html')
      .send(homePage);
  }

  private getServerRootPath(restConfig: RestServerConfig): string {
    const openApiConfig = restConfig.openApiSpec || {};
    const servers = openApiConfig.servers || [];
    let url = servers[0] ? servers[0].url : '';
    // trim trailing '/' so we can safely append rooted paths to it
    if (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    return url;
  }

  private getOpenApiSpecUrl(restConfig: RestServerConfig): string {
    const openApiConfig = restConfig.openApiSpec || {};
    const endpointMapping = openApiConfig.endpointMapping || {};
    const endpoint = Object.keys(endpointMapping).find(k =>
      isOpenApiV3Json(endpointMapping[k]),
    );
    return this.serverRootPath + (endpoint || '/openapi.json');
  }
}

function isOpenApiV3Json(mapping: OpenApiSpecForm) {
  return mapping.version === '3.0.0' && mapping.format === 'json';
}
