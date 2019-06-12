// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject} from '@loopback/context';
import {
  OpenApiSpecForm,
  RequestContext,
  RestBindings,
  RestServer,
  RestServerConfig,
} from '@loopback/rest';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as path from 'path';
import {RestExplorerBindings} from './rest-explorer.keys';
import {RestExplorerConfig} from './rest-explorer.types';

// TODO(bajtos) Allow users to customize the template
const indexHtml = path.resolve(__dirname, '../templates/index.html.ejs');
const template = fs.readFileSync(indexHtml, 'utf-8');
const templateFn = ejs.compile(template);

export class ExplorerController {
  static readonly OPENAPI_RELATIVE_URL = 'openapi.json';
  static readonly OPENAPI_FORM: OpenApiSpecForm = Object.freeze({
    version: '3.0.0',
    format: 'json',
  });

  private openApiSpecUrl: string;
  private useSelfHostedSpec: boolean;

  constructor(
    @inject(RestBindings.CONFIG, {optional: true})
    restConfig: RestServerConfig = {},
    @inject(RestExplorerBindings.CONFIG, {optional: true})
    explorerConfig: RestExplorerConfig = {},
    @inject(RestBindings.BASE_PATH) private serverBasePath: string,
    @inject(RestBindings.SERVER) private restServer: RestServer,
    @inject(RestBindings.Http.CONTEXT) private requestContext: RequestContext,
  ) {
    this.useSelfHostedSpec = explorerConfig.useSelfHostedSpec !== false;
    this.openApiSpecUrl = this.getOpenApiSpecUrl(restConfig);
  }

  indexRedirect() {
    const {request, response} = this.requestContext;
    let url = request.originalUrl || request.url;
    // be safe against path-modifying reverse proxies by generating the redirect
    // as a _relative_ URL
    const lastSlash = url.lastIndexOf('/');
    if (lastSlash >= 0) {
      url = './' + url.substr(lastSlash + 1) + '/';
    }
    response.redirect(301, url);
  }

  index() {
    let openApiSpecUrl = this.openApiSpecUrl;

    // if using self-hosted openapi spec, then the path to use is always the
    // exact relative path, and no base path logic needs to be applied
    if (!this.useSelfHostedSpec) {
      // baseURL is composed from mountPath and basePath
      // OpenAPI endpoints ignore basePath but do honor mountPath
      let rootPath = this.requestContext.request.baseUrl;
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
    }
    const data = {
      openApiSpecUrl,
    };

    const homePage = templateFn(data);
    this.requestContext.response
      .status(200)
      .contentType('text/html')
      .send(homePage);
  }

  spec() {
    return this.restServer.getApiSpec(this.requestContext);
  }

  private getOpenApiSpecUrl(restConfig: RestServerConfig): string {
    if (this.useSelfHostedSpec) {
      return './' + ExplorerController.OPENAPI_RELATIVE_URL;
    }
    const openApiConfig = restConfig.openApiSpec || {};
    const endpointMapping = openApiConfig.endpointMapping || {};
    const endpoint = Object.keys(endpointMapping).find(k =>
      isOpenApiV3Json(endpointMapping[k]),
    );
    return endpoint || '/openapi.json';
  }
}

function isOpenApiV3Json(mapping: OpenApiSpecForm) {
  return (
    mapping.version === ExplorerController.OPENAPI_FORM.version &&
    mapping.format === ExplorerController.OPENAPI_FORM.format
  );
}
