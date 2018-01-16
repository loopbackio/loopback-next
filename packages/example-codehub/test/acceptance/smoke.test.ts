// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/example-codehub
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CodeHubApplication} from '../../src/codehub-application';
import {validateApiSpec} from '@loopback/testlab';
import {RestServer} from '@loopback/rest';

describe('Server', () => {
  it('has a valid OpenAPI spec', async () => {
    const app = new CodeHubApplication();
    const server = await app.getServer(RestServer);
    await validateApiSpec(server.getApiSpec());
  });
});
