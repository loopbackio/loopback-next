// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  OpenApiSpecForm,
  Request,
  Response,
  RestBindings,
  RestServerConfig,
} from '@loopback/rest';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

// TODO(bajtos) Allow users to customize the template
const indexHtml = path.resolve(__dirname, '../templates/index.html.ejs');
const template = fs.readFileSync(indexHtml, 'utf-8');
const templateFn = ejs.compile(template);

export class ExplorerController {
  private openApiSpecUrl: string;

  constructor(
    @inject(RestBindings.CONFIG, {optional: true})
    restConfig: RestServerConfig = {},
    @inject(RestBindings.BASE_PATH) private serverBasePath: string,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {
    this.openApiSpecUrl = this.getOpenApiSpecUrl(restConfig);
  }

  indexRedirect() {
    const url = this.request.originalUrl || this.request.url;
    this.response.redirect(301, url + '/');
  }

  index() {
    let openApiSpecUrl = this.openApiSpecUrl;

    // baseURL is composed from mountPath and basePath
    // OpenAPI endpoints ignore basePath but do honor mountPath
    let rootPath = this.request.baseUrl;
    if (
      this.serverBasePath &&
      this.serverBasePath !== '/' &&
      rootPath.endsWith(this.serverBasePath)
    ) {
      rootPath = rootPath.slice(0, -this.serverBasePath.length);
    }

    if (rootPath && rootPath !== '/') {
      openApiSpecUrl = rootPath + openApiSpecUrl;
    }
    const data = {
      openApiSpecUrl,
    };

    const homePage = templateFn(data);
    this.response
      .status(200)
      .contentType('text/html')
      .send(homePage);
  }

  private getOpenApiSpecUrl(restConfig: RestServerConfig): string {
    const openApiConfig = restConfig.openApiSpec || {};
    const endpointMapping = openApiConfig.endpointMapping || {};
    const endpoint = Object.keys(endpointMapping).find(k =>
      isOpenApiV3Json(endpointMapping[k]),
    );
    return endpoint || '/openapi.json';
  }
}

function isOpenApiV3Json(mapping: OpenApiSpecForm) {
  return mapping.version === '3.0.0' && mapping.format === 'json';
}
