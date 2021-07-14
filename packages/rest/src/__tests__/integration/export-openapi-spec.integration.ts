// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApplicationConfig} from '@loopback/core';
import {expect, givenHttpServerConfig, TestSandbox} from '@loopback/testlab';
import fs from 'fs';
import {load} from 'js-yaml';
import path from 'path';
import {format} from 'util';
import {get, RestApplication} from '../..';

const sandbox = new TestSandbox(path.resolve(__dirname, '../../../.sandbox'));

describe('exportOpenApiSpec', () => {
  let app: MyApp;
  let lastLog = '';

  const log = (formatter: unknown, ...args: unknown[]) => {
    lastLog = format(formatter, ...args);
  };

  const expectedSpec = {
    openapi: '3.0.0',
    info: {
      title: 'LoopBack Application',
      version: '1.0.0',
    },
    paths: {
      '/hello': {
        get: {
          'x-controller-name': 'MyController',
          'x-operation-name': 'hello',
          tags: ['MyController'],
          responses: {
            '200': {
              description: 'Return value of MyController.hello',
            },
          },
          operationId: 'MyController.hello',
        },
      },
    },
    servers: [
      {
        url: '/',
      },
    ],
  };

  beforeEach(async () => {
    lastLog = '';
    await givenApp();
  });

  it('saves the spec to a json file for RestApplication', async () => {
    const file = path.join(sandbox.path, 'openapi.json');
    await app.exportOpenApiSpec(file, log);
    expectJsonSpec(file);
  });

  it('saves the spec to a json file for RestServer', async () => {
    const file = path.join(sandbox.path, 'openapi.json');
    await app.restServer.exportOpenApiSpec(file, log);
    expectJsonSpec(file);
  });

  it('writes the spec as a json document to console', async () => {
    await app.exportOpenApiSpec('-', log);
    expect(JSON.parse(lastLog)).to.eql(expectedSpec);
  });

  it('saves the spec to a yaml file', async () => {
    const file = path.join(sandbox.path, 'openapi.yaml');
    await app.restServer.exportOpenApiSpec(file, log);
    expect(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.yaml$/));
    const content = fs.readFileSync(file, 'utf-8');
    expect(load(content)).to.eql(expectedSpec);
  });

  it('saves the spec to a yml file', async () => {
    const file = path.join(sandbox.path, 'openapi.yml');
    await app.restServer.exportOpenApiSpec(file, log);
    expect(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.yml$/));
    const content = fs.readFileSync(file, 'utf-8');
    expect(load(content)).to.eql(expectedSpec);
  });

  after(() => sandbox.reset());

  function expectJsonSpec(file: string) {
    expect(lastLog.match(/The OpenAPI spec is saved to .+ openapi\.json$/));
    const content = fs.readFileSync(file, 'utf-8');
    expect(JSON.parse(content)).to.eql(expectedSpec);
  }

  class MyController {
    @get('/hello')
    hello() {
      return 'Hello';
    }
  }

  class MyApp extends RestApplication {
    constructor(config: ApplicationConfig) {
      super(config);
      this.controller(MyController);
    }
    async boot(): Promise<void> {}
  }

  async function givenApp() {
    app = new MyApp({rest: givenHttpServerConfig()});
    await app.boot();
    return app;
  }
});
