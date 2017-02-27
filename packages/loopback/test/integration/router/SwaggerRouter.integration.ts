// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import SwaggerRouter from '../../../lib/router/SwaggerRouter';
import {Controller} from '../../../lib/router/SwaggerRouter';
import * as http from 'http';
import {api} from '../../../lib/router/metadata';
import * as request from 'request-promise';
import { FullRequestResponse } from './../../support/FullRequestResponse';
import * as bluebird from 'bluebird';
import {expect} from 'testlab';
import {listen} from '../../support/util';

describe('SwaggerRouter', () => {
  let router: SwaggerRouter;
  beforeEach(givenRouter);

  it('handles simple "GET /hello" requests', async () => {
    const spec = {
      basePath: '/',
      paths: {
        '/hello': {
          'get': {
            'x-operation-name': 'greet',
            responses: {
              '200': { type: 'string' },
            },
          },
        },
      },
    };

    @api(spec)
    class HelloController {
      public async greet(): Promise<string> {
        return 'Hello world!';
      }
    }

    givenController(HelloController);

    const response = await requestEndpoint('GET', '/greet');

    expect(response.statusCode, 'statusCode').to.equal(200);
    expect(response.body, 'body').to.equal('Hello world!');
  });

  function givenRouter() {
    router = new SwaggerRouter();
  }

  function givenController(ctor: Controller) {
    router.controller(ctor);
  }

  async function requestEndpoint(verb: string, path: string): Promise<FullRequestResponse> {
    const server = http.createServer(router.handler);
    const baseUrl = await listen(server);
    return request({
      baseUrl,
      url: path,
      method: verb,
      resolveWithFullResponse: true,
    });
  }
});
