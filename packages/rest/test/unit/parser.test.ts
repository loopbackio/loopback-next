// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  parseOperationArgs,
  ParsedRequest,
  parseRequestUrl,
  PathParameterValues,
  Route,
  createResolvedRoute,
} from '../..';
import {expect, ShotRequest, ShotRequestOptions} from '@loopback/testlab';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec-types';

describe('operationArgsParser', () => {
  it('parses path parameters', async () => {
    const req = givenRequest();
    const spec = givenOperationWithParameters([
      {
        name: 'id',
        type: 'number',
        in: 'path',
      },
    ]);
    const route = givenResolvedRoute(spec, {id: 1});

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([1]);
  });

  it('parsed body parameter', async () => {
    const req = givenRequest({
      url: '/',
      payload: {key: 'value'},
    });

    const spec = givenOperationWithParameters([
      {
        name: 'data',
        schema: {type: 'object'},
        in: 'body',
      },
    ]);
    const route = givenResolvedRoute(spec);

    const args = await parseOperationArgs(req, route);

    expect(args).to.eql([{key: 'value'}]);
  });

  function givenOperationWithParameters(params?: ParameterObject[]) {
    return <OperationObject>{
      'x-operation-name': 'testOp',
      parameters: params,
      responses: {},
    };
  }

  function givenRequest(options?: ShotRequestOptions): ParsedRequest {
    return parseRequestUrl(new ShotRequest(options || {url: '/'}));
  }

  function givenResolvedRoute(
    spec: OperationObject,
    pathParams: PathParameterValues = {},
  ) {
    const route = new Route('get', '/', spec, () => {});
    return createResolvedRoute(route, pathParams);
  }
});
