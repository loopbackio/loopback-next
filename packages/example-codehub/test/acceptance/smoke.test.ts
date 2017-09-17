// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CodeHubApplication} from '../../src/codehub-application';
import {validateApiSpec} from '@loopback/testlab';
import {RestServer, RestComponent} from '@loopback/rest';

describe('Server', () => {
  it('has a valid OpenAPI spec', async () => {
    const app = new CodeHubApplication();
    const server = await app.getServer(RestServer);
    await validateApiSpec(server.getApiSpec());
  });
});
