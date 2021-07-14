// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {expect} from '@loopback/testlab';
import {RestBindings, Route, RouteSource} from '../../..';

describe('HandlerRoute', () => {
  describe('updateBindings()', () => {
    let appCtx: Context;
    let requestCtx: Context;

    before(givenContextsAndHandlerRoute);

    it('adds bindings to the request context', async () => {
      expect(await requestCtx.get(RestBindings.OPERATION_SPEC_CURRENT)).to.eql({
        responses: {'200': {description: 'An undocumented response body.'}},
      });
    });

    function givenContextsAndHandlerRoute() {
      const spec = anOperationSpec().build();

      const route = new Route('get', '/greet', spec, () => {});

      appCtx = new Context('application');
      requestCtx = new Context(appCtx, 'request');
      route.updateBindings(requestCtx);
    }
  });

  describe('toString', () => {
    it('implements toString for anonymous handler', () => {
      const spec = anOperationSpec().build();
      const route = new Route('get', '/greet', spec, () => {});
      expect(route.toString()).to.equal('Route - get /greet => () => { }');
      expect(new RouteSource(route).toString()).to.equal(
        'Route - get /greet => () => { }',
      );
    });

    it('implements toString for named handler', () => {
      const spec = anOperationSpec().build();
      const route = new Route('get', '/greet', spec, function process() {});
      expect(route.toString()).to.equal('Route - get /greet => process');
      expect(new RouteSource(route).toString()).to.equal(
        'Route - get /greet => process',
      );
    });
  });
});
