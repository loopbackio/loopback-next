// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/@loopback/rest.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {TrieRouter, RouteEntry, Request} from '../../..';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {ResolvedRoute} from '../../../src';

describe('trie router', () => {
  class TestTrieRouter extends TrieRouter {
    get staticRoutes() {
      return Object.values(this.routesWithoutPathVars);
    }
  }

  let router: TestTrieRouter;
  beforeEach(givenTrieRouter);

  const getVerbAndPath = (r?: RouteEntry) => ({
    verb: r && r.verb,
    path: r && r.path,
  });

  it('adds routes to routesWithoutPathVars', () => {
    const staticRoutes = router.staticRoutes.map(getVerbAndPath);

    for (const r of [
      {verb: 'post', path: '/orders'},
      {verb: 'patch', path: '/orders'},
      {verb: 'get', path: '/orders/count'},
      {verb: 'get', path: '/orders'},
      {verb: 'delete', path: '/orders'},
    ]) {
      expect(staticRoutes).to.containEql(r);
    }

    for (const r of [
      {verb: 'put', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders/{id}'},
      {verb: 'get', path: '/orders/{id}/exists'},
      {verb: 'get', path: '/orders/{id}'},
      {verb: 'delete', path: '/orders/{id}'},
      {verb: 'get', path: '/users/{id}'},
      {verb: 'get', path: '/users/{userId}/orders'},
      {verb: 'get', path: '/users/{id}/products'},
    ]) {
      expect(staticRoutes).to.not.containEql(r);
    }
  });

  it('lists routes by order', () => {
    expect(router.list().map(getVerbAndPath)).to.eql([
      {verb: 'post', path: '/orders'},
      {verb: 'put', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders'},
      {verb: 'get', path: '/orders/{id}/exists'},
      {verb: 'get', path: '/users/{userId}/orders'},
      {verb: 'get', path: '/users/{id}/products'},
      {verb: 'get', path: '/orders/count'},
      {verb: 'get', path: '/orders/{id}'},
      {verb: 'get', path: '/users/{id}'},
      {verb: 'get', path: '/orders'},
      {verb: 'delete', path: '/orders/{id}'},
      {verb: 'delete', path: '/orders'},
    ]);
  });

  it('finds route for GET /users/{id}', () => {
    const req = givenRequest({method: 'get', url: '/users/123'});
    const route = router.find(req);
    expect(getRouteInfo(route)).to.containEql({
      verb: 'get',
      path: '/users/{id}',
      params: {id: '123'},
    });
  });

  it('finds route for GET /users/{id}/products', () => {
    const req = givenRequest({method: 'get', url: '/users/123/products'});
    const route = router.find(req);
    expect(getRouteInfo(route)).to.containEql({
      verb: 'get',
      path: '/users/{id}/products',
      params: {id: '123'},
    });
  });

  it('finds route for GET /users/{userId}/orders', () => {
    const req = givenRequest({method: 'get', url: '/users/123/orders'});
    const route = router.find(req);
    expect(getRouteInfo(route)).to.containEql({
      verb: 'get',
      path: '/users/{userId}/orders',
      params: {userId: '123'},
    });
  });

  function getRouteInfo(r?: ResolvedRoute) {
    return {
      verb: r && r.verb,
      path: r && r.path,
      params: r && r.pathParams,
    };
  }

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }

  function givenTrieRouter() {
    router = new TestTrieRouter();
    for (const r of givenRoutes()) {
      router.add(r);
    }
    return router;
  }

  function givenRoutes() {
    const routes: RouteEntry[] = [];
    function addRoute(op: string, verb: string, path: string) {
      routes.push({
        verb,
        path,
        spec: anOperationSpec()
          .withOperationName(op)
          .build(),
        updateBindings: () => {},
        invokeHandler: async () => {},
        describe: () => op,
      });
    }

    addRoute('create', 'post', '/orders');
    addRoute('findAll', 'get', '/orders');
    addRoute('findById', 'get', '/orders/{id}');
    addRoute('updateById', 'patch', '/orders/{id}');
    addRoute('replaceById', 'put', '/orders/{id}');
    addRoute('count', 'get', '/orders/count');
    addRoute('exists', 'get', '/orders/{id}/exists');
    addRoute('deleteById', 'delete', '/orders/{id}');
    addRoute('deleteAll', 'delete', '/orders');
    addRoute('updateAll', 'patch', '/orders');

    addRoute('getUserById', 'get', '/users/{id}');
    addRoute('getUserOrders', 'get', '/users/{userId}/orders');
    addRoute('getUserRecommendation', 'get', '/users/{id}/products');

    return routes;
  }
});
