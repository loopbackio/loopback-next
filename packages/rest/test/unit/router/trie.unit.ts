// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Trie} from '../../..';
import {expect} from '@loopback/testlab';

interface Route {
  path: string;
  verb: string;
}

describe('Trie', () => {
  it('creates nodes', () => {
    const trie = givenTrie();
    const getOrders = givenRoute('get', '/orders');
    trie.create('get/orders', getOrders);
    expect(trie.root).to.containEql({
      key: '',
      children: {
        get: {
          key: 'get',
          children: {
            orders: {
              key: 'orders',
              value: getOrders,
              children: {},
            },
          },
        },
      },
    });
  });

  it('creates nodes with overlapping keys', () => {
    const trie = givenTrie();
    const getOrders = givenRoute('get', '/orders');
    const getOrderById = givenRoute('get', '/orders/{id}');
    trie.create('get/orders', getOrders);
    trie.create('get/orders/{id}', getOrderById);
    expect(trie.root).to.containEql({
      key: '',
      children: {
        get: {
          key: 'get',
          children: {
            orders: {
              key: 'orders',
              value: getOrders,
              children: {
                '{id}': {
                  key: '{id}',
                  value: getOrderById,
                  names: ['id'],
                  regexp: /^(.+)$/,
                  children: {},
                },
              },
            },
          },
        },
      },
    });
  });

  it('reports error for conflicting nodes', () => {
    const trie = givenTrie();
    const getOrders = givenRoute('get', '/orders');
    trie.create('get/orders', getOrders);
    expect(() =>
      trie.create('get/orders', givenRoute('post', '/orders')),
    ).to.throw(/Duplicate key found with different value/);
  });

  it('lists nodes with values', () => {
    const trie = givenTrie();
    const getOrders = givenRoute('get', '/orders');
    const getOrderById = givenRoute('get', '/orders/{id}');
    trie.create('get/orders', getOrders);
    trie.create('get/orders/{id}', getOrderById);
    const nodes = trie.list();
    expect(nodes).to.containDeepOrdered([
      {
        key: 'orders',
        value: {verb: 'get', path: '/orders'},
      },
      {
        key: '{id}',
        value: {verb: 'get', path: '/orders/{id}'},
        names: ['id'],
        regexp: /^(.+)$/,
      },
    ]);
  });

  it('skips nodes without values', () => {
    const trie = givenTrie();
    const getOrderById = givenRoute('get', '/orders/{id}');
    trie.create('get/orders/{id}', getOrderById);
    const nodes = trie.list();
    expect(nodes).to.eql([
      {
        key: '{id}',
        value: {verb: 'get', path: '/orders/{id}'},
        names: ['id'],
        regexp: /^(.+)$/,
        children: {},
      },
    ]);
  });

  it('matches nodes by keys', () => {
    const trie = givenTrie();
    const getOrders = givenRoute('get', '/orders');
    const createOrders = givenRoute('post', '/orders');
    const getOrderById = givenRoute('get', '/orders/{id}');
    const getOrderCount = givenRoute('get', '/orders/count');
    trie.create('get/orders', getOrders);
    trie.create('get/orders/{id}', getOrderById);
    trie.create('get/orders/count', getOrderCount);
    trie.create('post/orders', createOrders);
    expectMatch(trie, 'get/orders', getOrders);
    expectMatch(trie, '/get/orders/123', getOrderById, {id: '123'});
    expectMatch(trie, 'get/orders/count', getOrderCount);
    expectMatch(trie, 'post/orders', createOrders);
  });

  it('matches nodes by params', () => {
    const trie = givenTrie();
    const getUsersByName = givenRoute('get', '/users/{username}');
    trie.create('get/users/{username}', getUsersByName);
    expectMatch(trie, 'get/users/admin', getUsersByName, {username: 'admin'});
  });

  function expectMatch<T>(
    trie: Trie<T>,
    route: string,
    value: T,
    params?: object,
  ) {
    const resolved = trie.match(route);
    expect(resolved).not.is.undefined();
    expect(resolved!.node).to.containEql({value});
    params = params || {};
    expect(resolved!.params).to.eql(params);
  }

  function givenTrie() {
    return new Trie<Route>();
  }

  function givenRoute(verb: string, path: string) {
    return {verb, path};
  }
});
