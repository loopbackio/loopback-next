// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const swaggerUI = require('swagger-ui-dist');

import * as path from 'path';
import * as fs from 'fs';

import {Handler} from 'express';
import * as serveStatic from 'serve-static';
import * as ejs from 'ejs';

/**
 * Options to configure API Explorer UI
 */
export type ApiExplorerUIOptions = {
  /**
   * URL to the OpenAPI spec
   */
  openApiSpecUrl?: string;

  /**
   * Custom EJS template for index.html
   */
  indexHtmlTemplate?: string;

  /**
   * Options for serve-static middleware
   */
  serveStaticOptions?: serveStatic.ServeStaticOptions;

  /**
   * Path for the explorer UI
   */
  path?: string;
};

/**
 * Mount the API Explorer UI (swagger-ui) to the given express router
 * @param options
 */
export function apiExplorerUI(options: ApiExplorerUIOptions = {}): Handler {
  const openApiSpecUrl = options.openApiSpecUrl || '/openapi.json';
  const indexHtml =
    options.indexHtmlTemplate || path.resolve(__dirname, './index.html.ejs');
  const template = fs.readFileSync(indexHtml, 'utf-8');
  const templateFn = ejs.compile(template);
  const uiHandler = serveStatic(
    swaggerUI.getAbsoluteFSPath(),
    options.serveStaticOptions,
  );

  return (req, res, next) => {
    if (req.path === '/' || req.path === '/index.html') {
      const data = {
        openApiSpecUrl,
      };
      const homePage = templateFn(data);
      res
        .status(200)
        .contentType('text/html')
        .send(homePage);
    } else {
      uiHandler(req, res, next);
    }
  };
}
