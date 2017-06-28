// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ServerRequest,
  ParsedRequest,
  parseRequestUrl,
  RoutingTable,
  ResolvedRoute,
} from '../..';
import {expect, ShotRequestOptions, ShotRequest} from '@loopback/testlab';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec';
import {givenOpenApiSpec} from '@loopback/openapi-spec-builder';

describe('RoutingTable', () => {
  it('finds simple "GET /hello" endpoint', () => {
    const spec = givenOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    const table = new RoutingTable();
    table.registerController('TestController', spec);

    const request = givenRequest({
      method: 'get',
      url: '/hello',
    });

    const route = table.find(request);

    expect(route).to.deepEqual({
      controller: 'TestController',
      methodName: 'greet',
      pathParams: Object.create(null),
      spec: spec.paths['/hello'].get,
    });
  });

  function givenRequest(options?: ShotRequestOptions): ParsedRequest {
    return parseRequestUrl(new ShotRequest(options || {url: '/'}));
  }
});
