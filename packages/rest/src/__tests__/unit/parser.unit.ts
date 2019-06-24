// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/openapi-v3';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {
  createResolvedRoute,
  JsonBodyParser,
  parseOperationArgs,
  PathParameterValues,
  RawBodyParser,
  Request,
  RequestBodyParser,
  RequestBodyParserOptions,
  RestHttpErrors,
  Route,
  StreamBodyParser,
  TextBodyParser,
  UrlEncodedBodyParser,
} from '../..';

describe('operationArgsParser', () => {
  let requestBodyParser: RequestBodyParser;
  before(givenRequestBodyParser);

  it('parses path parameters', async () => {
    const req = givenRequest();
    const spec = givenOperationWithParameters([
      {
        name: 'id',
        type: 'number',
        in: 'path',
        required: true,
      },
    ]);
    const route = givenResolvedRoute(spec, {id: 1});

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([1]);
  });

  it('parses body parameter', async () => {
    const req = givenRequest({
      url: '/',
      payload: {key: 'value'},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {'application/json': {schema: {type: 'object'}}},
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key: 'value'}]);
  });

  it('parses nullable body parameter', async () => {
    const req = givenRequest({
      url: '/',
      payload: {key: null},
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              key: {
                type: 'string',
                nullable: true,
              },
            },
          },
        },
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key: null}]);
  });

  it('parses body parameter for urlencoded', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: 'key=value',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {schema: {type: 'object'}},
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key: 'value'}]);
  });

  it('parses body parameter for urlencoded with simple types', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: 'key1=value&key2=1&key3=true',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              key1: {type: 'string'},
              key2: {type: 'number'},
              key3: {type: 'boolean'},
            },
          },
        },
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key1: 'value', key2: 1, key3: true}]);
  });

  it('parses body parameter for urlencoded with number[] types', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: 'key=1&key=2',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              key: {type: 'array', items: {type: 'number'}},
            },
          },
        },
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key: [1, 2]}]);
  });

  it('parses body parameter for urlencoded with complex types', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload:
        'name=IBM%20HQ&location[lat]=0.741895&location[lng]=-73.989308&tags[0]=IT&tags[1]=NY',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              name: {type: 'string'},
              location: {
                type: 'object',
                properties: {
                  lat: {type: 'number'},
                  lng: {type: 'number'},
                },
              },
              tags: {
                type: 'array',
                items: {type: 'string'},
              },
            },
          },
        },
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([
      {
        name: 'IBM HQ',
        location: {lat: 0.741895, lng: -73.989308},
        tags: ['IT', 'NY'],
      },
    ]);
  });

  it('parses body parameter for urlencoded with string[] types', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      payload: 'key1=value1&key1=value2',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'application/x-www-form-urlencoded': {
          schema: {
            type: 'object',
            properties: {
              key1: {type: 'array', items: {type: 'string'}},
            },
          },
        },
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql([{key1: ['value1', 'value2']}]);
  });

  it('parses body parameter for text data', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'text/plain',
      },
      payload: 'plain-text',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'text/plain': {schema: {type: 'string'}},
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql(['plain-text']);
  });

  it('parses body parameter for html data', async () => {
    const req = givenRequest({
      url: '/',
      headers: {
        'Content-Type': 'text/html',
      },
      payload: '<html><body><h1>Hello</h1></body></html>',
    });

    const spec = givenOperationWithRequestBody({
      description: 'data',
      content: {
        'text/html': {schema: {type: 'string'}},
      },
    });
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route, requestBodyParser);

    expect(args).to.eql(['<html><body><h1>Hello</h1></body></html>']);
  });

  context('in:query style:deepObject', () => {
    it('parses JSON-encoded string value', async () => {
      const req = givenRequest({
        url: '/?value={"key":"value"}',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      const args = await parseOperationArgs(req, route, requestBodyParser);

      expect(args).to.eql([{key: 'value'}]);
    });

    it('parses object value provided via nested keys', async () => {
      const req = givenRequest({
        url: '/?value[key]=value',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      const args = await parseOperationArgs(req, route, requestBodyParser);

      expect(args).to.eql([{key: 'value'}]);
    });

    it('rejects malformed JSON string', async () => {
      const req = givenRequest({
        url: '/?value={"malformed-JSON"}',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      await expect(
        parseOperationArgs(req, route, requestBodyParser),
      ).to.be.rejectedWith(
        RestHttpErrors.invalidData('{"malformed-JSON"}', 'value', {
          details: {
            syntaxError: 'Unexpected token } in JSON at position 17',
          },
        }),
      );
    });

    it('rejects array values encoded as JSON', async () => {
      const req = givenRequest({
        url: '/?value=[1,2]',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      await expect(
        parseOperationArgs(req, route, requestBodyParser),
      ).to.be.rejectedWith(RestHttpErrors.invalidData('[1,2]', 'value'));
    });

    it('rejects array values provided via nested keys', async () => {
      const req = givenRequest({
        url: '/?value=1&value=2',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      await expect(
        parseOperationArgs(req, route, requestBodyParser),
      ).to.be.rejectedWith(RestHttpErrors.invalidData(['1', '2'], 'value'));
    });

    function givenOperationWithObjectParameter(
      name: string,
      schema: SchemaObject = {type: 'object', additionalProperties: true},
    ) {
      expect(schema).to.have.property('type', 'object');
      return givenOperationWithParameters([
        {
          name,
          in: 'query',
          style: 'deepObject',
          explode: true,
          schema,
        },
      ]);
    }
  });

  function givenRequestBodyParser() {
    const options: RequestBodyParserOptions = {};
    const parsers = [
      new JsonBodyParser(options),
      new UrlEncodedBodyParser(options),
      new TextBodyParser(options),
      new StreamBodyParser(),
      new RawBodyParser(options),
    ];
    requestBodyParser = new RequestBodyParser(parsers, new Context());
  }

  function givenOperationWithParameters(params?: ParameterObject[]) {
    return <OperationObject>{
      'x-operation-name': 'testOp',
      parameters: params,
      responses: {},
    };
  }

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
});
