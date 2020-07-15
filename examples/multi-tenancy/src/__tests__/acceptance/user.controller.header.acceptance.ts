// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect} from '@loopback/testlab';
import {
  ExampleMultiTenancyApplication,
  MultiTenancyBindings,
  MultiTenancyMiddlewareOptions,
} from '../..';
import {setupApplication} from './test-helper';

describe('UserController with header-based multi-tenancy', () => {
  let app: ExampleMultiTenancyApplication;
  let client: Client;

  before('setupApplication', async () => {
    ({app, client} = await setupApplication());
    app
      .configure<MultiTenancyMiddlewareOptions>(MultiTenancyBindings.MIDDLEWARE)
      .to({strategyNames: ['jwt', 'header', 'query']});
  });

  before('create users', async () => {
    // Tenant abc
    await client.post('/users').set('x-tenant-id', 'abc').send({name: 'John'});
    // Tenant xyz
    await client.post('/users').set('x-tenant-id', 'xyz').send({name: 'Mary'});
    // No tenant
    await client.post('/users').send({tenantId: '', name: 'Jane'});
  });

  after(async () => {
    await app.stop();
  });

  it('Get users by tenantId - abc', async () => {
    const res = await client
      .get('/users')
      .set('x-tenant-id', 'abc')
      .expect(200);
    expect(res.body).to.eql([{tenantId: 'abc', id: '1', name: 'John'}]);
  });

  it('Get users by tenantId - xyz', async () => {
    const res = await client
      .get('/users')
      .set('x-tenant-id', 'xyz')
      .expect(200);
    expect(res.body).to.eql([{tenantId: 'xyz', id: '1', name: 'Mary'}]);
  });

  it('Get users by tenantId - none', async () => {
    const res = await client.get('/users').expect(200);
    expect(res.body).to.eql([{tenantId: '', id: '1', name: 'Jane'}]);
  });
});
