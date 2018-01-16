// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-codehub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, supertest as request} from '@loopback/testlab';
import * as util from '../support/util';

describe('users', () => {
  let client: request.SuperTest<request.Test>;

  before(givenClientAndApp);

  it('gets all users', async () => {
    const response = await client
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).to.eql([]);
  });

  it('gets user by name', async () => {
    const response = await client
      .get('/users/admin')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body).to.eql({
      name: 'admin',
    });
  });

  async function givenClientAndApp() {
    const result = await util.createAppAndClient();
    client = result.client;
  }
});
