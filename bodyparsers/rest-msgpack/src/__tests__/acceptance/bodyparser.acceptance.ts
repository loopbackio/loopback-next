// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest-msgpack
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {
  createResolvedRoute,
  HttpErrors,
  OperationObject,
  parseOperationArgs,
  PathParameterValues,
  Request,
  RequestBodyObject,
  RequestBodyParser,
  Route,
} from '@loopback/rest';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {MsgPackBodyParser} from '../..';
const msgpack = require('msgpack')();

describe('MessagePack body parser', () => {
  let requestBodyParser: RequestBodyParser;
  beforeEach(givenRequestBodyParser);

  const contentTypes = [
    'application/msgpack',
    'application/x-msgpack',
    'application/subtype+msgpack',
  ];

  for (const contentType of contentTypes) {
    it(`parses ${contentType} body as MessagePack data`, async () => {
      const spec = givenOperationWithRequestBody({
        description: 'data',
        content: {
          [contentType]: {
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'string',
                },
              },
            },
          },
        },
      });

      const req = givenRequest({
        url: '/',
        headers: {
          'Content-Type': contentType,
        },
        payload: msgpack.encode({
          data: 'hello world',
        }),
      });

      const route = givenResolvedRoute(spec);
      const args = await parseOperationArgs(req, route, requestBodyParser);

      expect(args).to.eql([{data: 'hello world'}]);
    });
  }

  it(`rejects MessagePack data that do not conform to OAS 3 Schema Object`, async () => {
    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/msgpack': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'number',
              },
            },
          },
        },
      },
    });

    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/msgpack',
      },
      payload: msgpack.encode({
        data: 'does not conform to OAS 3 Schema Object',
      }),
    });

    const route = givenResolvedRoute(spec);

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    expect(
      parseOperationArgs(req, route, requestBodyParser),
    ).to.be.rejectedWith(HttpErrors.UnprocessableEntity);
  });

  function givenOperationWithRequestBody(requestBody?: RequestBodyObject) {
    return <OperationObject>{
      'x-operation-name': 'testOp',
      requestBody: requestBody,
      responses: {},
    };
  }

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }

  function givenResolvedRoute(
    spec: OperationObject,
    pathParams: PathParameterValues = {},
  ) {
    const route = new Route('get', '/', spec, () => {});
    return createResolvedRoute(route, pathParams);
  }

  function givenRequestBodyParser() {
    const options = {};
    const parsers = [new MsgPackBodyParser(options)];
    const context = new Context();
    requestBodyParser = new RequestBodyParser(parsers, context);
  }
});
