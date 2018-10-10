// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  SchemaObject,
} from '@loopback/openapi-v3-types';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {
  createResolvedRoute,
  parseOperationArgs,
  PathParameterValues,
  Request,
  RestHttpErrors,
  Route,
} from '../..';

describe('operationArgsParser', () => {
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

    const args = await parseOperationArgs(req, route);

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

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key: 'value'}]);
  });

  it('parses body parameter for form data', async () => {
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

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key: 'value'}]);
  });

  it('parses body parameter for form data with simple types', async () => {
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

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key1: 'value', key2: 1, key3: true}]);
  });

  it('parses body parameter for form data with number[] types', async () => {
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

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key: [1, 2]}]);
  });

  it('parses body parameter for form data with string[] types', async () => {
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

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key1: ['value1', 'value2']}]);
  });

  context('in:query style:deepObject', () => {
    it('parses JSON-encoded string value', async () => {
      const req = givenRequest({
        url: '/?value={"key":"value"}',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      const args = await parseOperationArgs(req, route);

      expect(args).to.eql([{key: 'value'}]);
    });

    it('parses object value provided via nested keys', async () => {
      const req = givenRequest({
        url: '/?value[key]=value',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      const args = await parseOperationArgs(req, route);

      expect(args).to.eql([{key: 'value'}]);
    });

    it('rejects malformed JSON string', async () => {
      const req = givenRequest({
        url: '/?value={"malformed-JSON"}',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      await expect(parseOperationArgs(req, route)).to.be.rejectedWith(
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

      await expect(parseOperationArgs(req, route)).to.be.rejectedWith(
        RestHttpErrors.invalidData('[1,2]', 'value'),
      );
    });

    it('rejects array values provided via nested keys', async () => {
      const req = givenRequest({
        url: '/?value=1&value=2',
      });

      const spec = givenOperationWithObjectParameter('value');
      const route = givenResolvedRoute(spec);

      await expect(parseOperationArgs(req, route)).to.be.rejectedWith(
        RestHttpErrors.invalidData(['1', '2'], 'value'),
      );
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
