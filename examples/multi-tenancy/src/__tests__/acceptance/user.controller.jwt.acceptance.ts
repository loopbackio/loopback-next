// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-multi-tenancy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Client, expect, supertest} from '@loopback/testlab';
import {sign} from 'jsonwebtoken';
import {ExampleMultiTenancyApplication} from '../..';
import {
  MultiTenancyBindings,
  MultiTenancyMiddlewareOptions,
} from '../../multi-tenancy';
import {setupApplication} from './test-helper';

describe('UserController with jwt-based multi-tenancy', () => {
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
    await addJWT(client.post('/users'), 'abc').send({name: 'John'}).expect(200);
    // Tenant xyz
    await addJWT(client.post('/users'), 'xyz').send({name: 'Mary'}).expect(200);
    // No tenant
    await client.post('/users').send({name: 'Jane'});
  });

  after(async () => {
    await app.stop();
  });

  it('Get users by tenantId - abc', async () => {
    const res = await addJWT(client.get('/users'), 'abc').expect(200);
    expect(res.body).to.eql([{tenantId: 'abc', id: '1', name: 'John'}]);
  });

  it('Get users by tenantId - xyz', async () => {
    const res = await addJWT(client.get('/users'), 'xyz').expect(200);
    expect(res.body).to.eql([{tenantId: 'xyz', id: '1', name: 'Mary'}]);
  });

  it('Get users by tenantId - none', async () => {
    const res = await client.get('/users').expect(200);
    expect(res.body).to.eql([{tenantId: '', id: '1', name: 'Jane'}]);
  });

  function addJWT(test: supertest.Test, tenantId: string) {
    const tenant = {
      tenantId,
    };
    const jwt = sign(tenant, 'my-secret');
    const token = `Bearer ${jwt}`;
    return test.set('authorization', token);
  }
});
