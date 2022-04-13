// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, inject} from '@loopback/core';
import {
  OpenApiSpecForm,
  RequestContext,
  RestBindings,
  RestServer,
  RestServerConfig,
} from '@loopback/rest';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import {RestExplorerBindings} from './rest-explorer.keys';
import {RestExplorerConfig} from './rest-explorer.types';

let prevIndexTemplatePath: string;
let templateFn: ejs.TemplateFunction;

export class ExplorerController {
  static readonly OPENAPI_RELATIVE_URL = 'openapi.json';
  static readonly OPENAPI_FORM: OpenApiSpecForm = Object.freeze({
    version: '3.0.0',
    format: 'json',
  });

  private openApiSpecUrl: string;
  private useSelfHostedSpec: boolean;
  private swaggerThemeFile: string;
  private indexTemplatePath: string;
  private indexTemplateTitle: string;

  constructor(
    @inject(RestBindings.CONFIG, {optional: true})
    restConfig: RestServerConfig = {},
    @config({fromBinding: RestExplorerBindings.COMPONENT})
    explorerConfig: RestExplorerConfig = {},
    @inject(RestBindings.BASE_PATH) private serverBasePath: string,
    @inject(RestBindings.SERVER) private restServer: RestServer,
    @inject(RestBindings.Http.CONTEXT) private requestContext: RequestContext,
  ) {
    this.useSelfHostedSpec = explorerConfig.useSelfHostedSpec !== false;
    this.openApiSpecUrl = this.getOpenApiSpecUrl(restConfig);
    this.swaggerThemeFile =
      explorerConfig.swaggerThemeFile ?? './swagger-ui.css';
    this.indexTemplatePath =
      explorerConfig.indexTemplatePath ??
      path.resolve(__dirname, '../templates/index.html.ejs');
    this.indexTemplateTitle =
      explorerConfig?.indexTitle ?? 'LoopBack API Explorer';
  }

  indexRedirect() {
    const {request, response} = this.requestContext;
    let url = request.originalUrl || request.url;
    // be safe against path-modifying reverse proxies by generating the redirect
    // as a _relative_ URL
    const lastSlash = url.lastIndexOf('/');
    if (lastSlash >= 0) {
      url = './' + url.slice(lastSlash + 1) + '/';
    }
    response.redirect(301, url);
  }

  index() {
    const swaggerThemeFile = this.swaggerThemeFile;
    let openApiSpecUrl = this.openApiSpecUrl;
    const indexTemplateTitle = this.indexTemplateTitle;

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
      swaggerThemeFile,
      indexTemplateTitle,
    };

    if (prevIndexTemplatePath !== this.indexTemplatePath) {
      const template = fs.readFileSync(this.indexTemplatePath, 'utf-8');
      templateFn = ejs.compile(template);
      prevIndexTemplatePath = this.indexTemplatePath;
    }

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
    const openApiConfig = restConfig.openApiSpec ?? {};
    const endpointMapping = openApiConfig.endpointMapping ?? {};
    const endpoint = Object.keys(endpointMapping).find(k =>
      isOpenApiV3Json(endpointMapping[k]),
    );
    return endpoint ?? '/openapi.json';
  }
}

function isOpenApiV3Json(mapping: OpenApiSpecForm) {
  return (
    mapping.version === ExplorerController.OPENAPI_FORM.version &&
    mapping.format === ExplorerController.OPENAPI_FORM.format
  );
}
