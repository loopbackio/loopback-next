// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/@loopback/rest.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {TrieRouter, RouteEntry} from '../../..';
import {anOperationSpec} from '@loopback/openapi-spec-builder';

describe('trie router', () => {
  class TestTrieRouter extends TrieRouter {
    get staticRoutes() {
      return Object.values(this.routesWithoutPathVars);
    }
  }

  const getVerbAndPath = (r: RouteEntry) => ({verb: r.verb, path: r.path});

  it('adds routes to routesWithoutPathVars', () => {
    const router = givenTrieRouter();
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
    ]) {
      expect(staticRoutes).to.not.containEql(r);
    }
  });

  it('list routes by order', () => {
    const router = givenTrieRouter();

    expect(router.list().map(getVerbAndPath)).to.eql([
      {verb: 'post', path: '/orders'},
      {verb: 'put', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders/{id}'},
      {verb: 'patch', path: '/orders'},
      {verb: 'get', path: '/orders/{id}/exists'},
      {verb: 'get', path: '/orders/count'},
      {verb: 'get', path: '/orders/{id}'},
      {verb: 'get', path: '/orders'},
      {verb: 'delete', path: '/orders/{id}'},
      {verb: 'delete', path: '/orders'},
    ]);
  });

  function givenTrieRouter() {
    const router = new TestTrieRouter();
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

    return routes;
  }
});
