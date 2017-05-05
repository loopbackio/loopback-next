// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { CodeHubApplication } from '../../src/CodeHubApplication';
import {expect, supertest as request} from '@loopback/testlab';
import * as util from '../support/util';

describe('health', () => {
  let app: CodeHubApplication;
  let client: request.SuperTest<request.Test>;

  before(givenClientAndApp);

  it('returns the uptime', async () => {
    const response = await client
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);
    expect(response.body.uptime).to.be.Number();
  });

  async function givenClientAndApp() {
    const result = await util.createAppAndClient();
    client = result.client;
    app = result.app;
  }
});
