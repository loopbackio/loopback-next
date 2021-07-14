// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';
import {RestServer, RestComponent} from '../../..';

describe('RestServer.redirect()', () => {
  it('binds the redirect route', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    server.redirect('/test', '/test/');
    const boundRoutes = server.find('routes.*').map(b => b.key);
    expect(boundRoutes).to.containEql('routes.get %2Ftest');
  });
});
