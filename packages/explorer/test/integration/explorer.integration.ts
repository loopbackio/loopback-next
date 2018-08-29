// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {createClientForHandler} from '@loopback/testlab';
import {apiExplorerUI} from '../../src/explorer';
import * as express from 'express';
import * as path from 'path';

describe('API Explorer UI', () => {
  let app: express.Application;
  let router: express.Router;

  beforeEach(() => {
    app = express();
    router = express.Router();
    app.use('/api-explorer', router);
  });

  it('mounts API explorer UI', () => {
    router.use(apiExplorerUI());
    const test = createClientForHandler(app);
    test
      .get('/api-explorer')
      .expect('content-type', 'text/html')
      .expect(200, '<title>LoopBack API Explorer</title>');

    test.get('/api-explorer/swagger-ui-bundle.js').expect(200);
  });

  it('accepts API explorer UI options - openApiSpecUrl', () => {
    router.use(
      apiExplorerUI({
        openApiSpecUrl: 'https://localhost:8080/openapi.json',
      }),
    );
    const test = createClientForHandler(app);
    test
      .get('/api-explorer')
      .expect('content-type', 'text/html')
      .expect(200, 'https://localhost:8080/openapi.json');
  });

  it('accepts API explorer UI options - indexHtmlTemplate', () => {
    router.use(
      apiExplorerUI({
        indexHtmlTemplate: path.resolve(__dirname, 'test.html.ejs'),
      }),
    );
    const test = createClientForHandler(app);
    test
      .get('/api-explorer')
      .expect('content-type', 'text/html')
      .expect(200, '<title>Test API Explorer</title>');
  });
});
