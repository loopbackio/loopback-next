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
  ControllerRoute,
} from '../../..';
import {expect, ShotRequestOptions, ShotRequest} from '@loopback/testlab';
import {OperationObject, ParameterObject} from '@loopback/openapi-spec';
import {anOpenApiSpec} from '@loopback/openapi-spec-builder';

describe('RoutingTable', () => {
  it('finds simple "GET /hello" endpoint', () => {
    const spec = anOpenApiSpec()
      .withOperationReturningString('get', '/hello', 'greet')
      .build();

    class TestController {
    }

    const table = new RoutingTable();
    table.registerController(TestController, spec);

    const request = givenRequest({
      method: 'get',
      url: '/hello',
    });

    const route = table.find(request);

    expect(route).to.be.instanceOf(ControllerRoute);
    expect(route).to.have.property('spec').containEql(spec.paths['/hello'].get);
    expect(route).to.have.property('pathParams');
    expect(route.describe()).to.equal('TestController.greet');
  });

  function givenRequest(options?: ShotRequestOptions): ParsedRequest {
    return parseRequestUrl(new ShotRequest(options || {url: '/'}));
  }
});
