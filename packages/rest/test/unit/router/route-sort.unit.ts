// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/@loopback/rest.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {compareRoute} from '../../..';

describe('route sorter', () => {
  it('sorts routes', () => {
    const routes = givenRoutes();
    // Sort endpoints by their verb/path templates
    const sortedEndpoints = Object.entries(routes).sort((a, b) =>
      compareRoute(a[1], b[1]),
    );
    expect(sortedEndpoints).to.eql([
      ['create', {verb: 'post', path: '/orders'}],
      ['replaceById', {verb: 'put', path: '/orders/{id}'}],
      ['updateById', {verb: 'patch', path: '/orders/{id}'}],
      ['updateAll', {verb: 'patch', path: '/orders'}],
      ['exists', {verb: 'get', path: '/orders/{id}/exists'}],
      ['count', {verb: 'get', path: '/orders/count'}],
      ['findById', {verb: 'get', path: '/orders/{id}'}],
      ['findAll', {verb: 'get', path: '/orders'}],
      ['deleteById', {verb: 'delete', path: '/orders/{id}'}],
      ['deleteAll', {verb: 'delete', path: '/orders'}],
    ]);
  });

  function givenRoutes() {
    return {
      create: {
        verb: 'post',
        path: '/orders',
      },
      findAll: {
        verb: 'get',
        path: '/orders',
      },
      findById: {
        verb: 'get',
        path: '/orders/{id}',
      },
      updateById: {
        verb: 'patch',
        path: '/orders/{id}',
      },
      replaceById: {
        verb: 'put',
        path: '/orders/{id}',
      },
      count: {
        verb: 'get',
        path: '/orders/count',
      },
      exists: {
        verb: 'get',
        path: '/orders/{id}/exists',
      },
      deleteById: {
        verb: 'delete',
        path: '/orders/{id}',
      },
      deleteAll: {
        verb: 'delete',
        path: '/orders',
      },
      updateAll: {
        verb: 'patch',
        path: '/orders',
      },
    };
  }
});
