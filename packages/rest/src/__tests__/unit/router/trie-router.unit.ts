// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {Request, ResolvedRoute, RouteEntry, TrieRouter} from '../../..';
import {RestRouterOptions} from '../../../router';

class TestTrieRouter extends TrieRouter {
  get staticRoutes() {
    return Object.values(this.routesWithoutPathVars);
  }
}

describe('trie router', () => {
  let router: TestTrieRouter;
  before(givenRouter);

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
      {verb: 'get', path: '/orders/count'},
      {verb: 'get', path: '/orders/{id}/exists'},
      {verb: 'put', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders/{id}'},
      {verb: 'get', path: '/orders/{id}'},
      {verb: 'delete', path: '/orders/{id}'},
      {verb: 'post', path: '/orders'},
      {verb: 'patch', path: '/orders'},
      {verb: 'get', path: '/orders'},
      {verb: 'delete', path: '/orders'},
      {verb: 'get', path: '/users/{userId}/orders'},
      {verb: 'get', path: '/users/{id}/products'},
      {verb: 'get', path: '/users/{id}'},
    ]);
  });

  function getVerbAndPath(r?: RouteEntry) {
    return {
      verb: r?.verb,
      path: r?.path,
    };
  }

  function givenRoutes() {
    const routes: RouteEntry[] = [];
    addRoute(routes, 'create', 'post', '/orders');
    addRoute(routes, 'findAll', 'get', '/orders');
    addRoute(routes, 'findById', 'get', '/orders/{id}');
    addRoute(routes, 'updateById', 'patch', '/orders/{id}');
    addRoute(routes, 'replaceById', 'put', '/orders/{id}');
    addRoute(routes, 'count', 'get', '/orders/count');
    addRoute(routes, 'exists', 'get', '/orders/{id}/exists');
    addRoute(routes, 'deleteById', 'delete', '/orders/{id}');
    addRoute(routes, 'deleteAll', 'delete', '/orders');
    addRoute(routes, 'updateAll', 'patch', '/orders');

    addRoute(routes, 'getUserById', 'get', '/users/{id}');
    addRoute(routes, 'getUserOrders', 'get', '/users/{userId}/orders');
    addRoute(routes, 'getUserRecommendation', 'get', '/users/{id}/products');

    return routes;
  }

  function givenRouter() {
    router = givenTrieRouter(givenRoutes());
  }
});

/**
 * This suite covers the following trie-based routes:
 * ```
 * get
 *   |_ users
 *      |_ {id} (get /users/{id})
 *         |_ products (get /users/{id}/products)
 *      |_ {userId}
 *         |_ orders (get /users/{userId}/orders)
 * ```
 *
 * To match `GET /users/{userId}/orders`, the trie router needs to try both
 * `/users/{id}` and `/users/{userId}` sub-trees.
 */
describe('trie router - overlapping paths with different var names', () => {
  let router: TestTrieRouter;
  before(givenRouter);

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

  function givenRoutesWithDifferentVars() {
    const routes: RouteEntry[] = [];

    addRoute(routes, 'getUserById', 'get', '/users/{id}');
    addRoute(routes, 'getUserOrders', 'get', '/users/{userId}/orders');
    addRoute(routes, 'getUserRecommendation', 'get', '/users/{id}/products');

    return routes;
  }

  function givenRouter() {
    router = givenTrieRouter(givenRoutesWithDifferentVars());
  }
});

describe('trie router with options', () => {
  let router: TestTrieRouter;

  describe('strict: true', () => {
    before(givenStrictRouter);
    it('finds route for GET /users/', () => {
      testStrictRouter('/users/');
    });

    it('fails to find route for GET /users', () => {
      const req = givenRequest({method: 'get', url: '/users'});
      const route = router.find(req);
      expect(route).to.be.undefined();
    });

    it('finds route for GET /orders', () => {
      testStrictRouter('/orders');
    });

    it('fails to find route for GET /orders/', () => {
      const req = givenRequest({method: 'get', url: '/orders/'});
      const route = router.find(req);
      expect(route).to.be.undefined();
    });

    function testStrictRouter(path: string) {
      const req = givenRequest({method: 'get', url: path});
      const route = router.find(req);
      expect(getRouteInfo(route)).to.containEql({
        verb: 'get',
        path,
        params: {},
      });
    }

    function givenStrictRouter() {
      router = givenTrieRouter(givenRoutesWithDifferentVars(), {strict: true});
    }
  });

  describe('strict: false', () => {
    before(givenNonStrictRouter);
    it('finds route for GET /users/', () => {
      testNonStrictRouter('/users/');
    });

    it('finds route for GET /users', () => {
      testNonStrictRouter('/users', '/users/');
    });

    it('finds route for GET /orders/', () => {
      testNonStrictRouter('/orders/', '/orders');
    });

    it('finds route for GET /orders', () => {
      testNonStrictRouter('/orders');
    });

    function testNonStrictRouter(path: string, expected?: string) {
      expected = expected ?? path;
      const req = givenRequest({method: 'get', url: path});
      const route = router.find(req);
      expect(getRouteInfo(route)).to.containEql({
        verb: 'get',
        path: expected,
        params: {},
      });
    }

    function givenNonStrictRouter() {
      router = givenTrieRouter(givenRoutesWithDifferentVars(), {strict: false});
    }
  });

  function givenRoutesWithDifferentVars() {
    const routes: RouteEntry[] = [];

    addRoute(routes, 'getUsers', 'get', '/users/');
    addRoute(routes, 'getOrders', 'get', '/orders');

    return routes;
  }
});

function getRouteInfo(r?: ResolvedRoute) {
  return {
    verb: r?.verb,
    path: r?.path,
    params: r?.pathParams,
  };
}

function givenRequest(options?: ShotRequestOptions): Request {
  return stubExpressContext(options).request;
}

function givenTrieRouter(routes: RouteEntry[], options?: RestRouterOptions) {
  const router = new TestTrieRouter(options);
  for (const r of routes) {
    router.add(r);
  }
  return router;
}

function addRoute(
  routes: RouteEntry[],
  op: string,
  verb: string,
  path: string,
) {
  routes.push({
    verb,
    path,
    spec: anOperationSpec().withOperationName(op).build(),
    updateBindings: () => {},
    invokeHandler: async () => {},
    describe: () => op,
  });
}
