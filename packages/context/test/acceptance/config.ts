// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject} from '../..';

interface RestServerConfig {
  host?: string;
  port?: number;
}

class RestServer {
  constructor(@inject.config() public config: RestServerConfig) {}
}

describe('Context bindings - injecting configuration for bound artifacts', () => {
  it('binds configuration independent of binding', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx.bind('servers.rest.server1:$config').to({port: 3000});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');

    expect(server1.config).to.eql({port: 3000});
  });

  it('configure an artifact with a dynamic source', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx
      .bind('servers.rest.server1:$config')
      .toDynamicValue(() => Promise.resolve({port: 3000}));

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.config).to.eql({port: 3000});
  });

  it('configure values at parent level(s)', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx.bind('servers.rest:$config').to({server1: {port: 3000}});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.config).to.eql({port: 3000});
  });

  it.skip('binds configuration for environments', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx.bind('servers.rest.server1:$config.dev').to({port: 4000});
    ctx.bind('servers.rest.server1:$config.test').to({port: 3000});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');

    expect(server1.config).to.eql({port: 3000});
  });
});
