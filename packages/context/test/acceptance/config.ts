// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Context, inject, ENVIRONMENT_KEY} from '../..';

interface RestServerConfig {
  host?: string;
  port?: number;
}

class RestServer {
  constructor(@inject.config() public config: RestServerConfig) {}
}

class RestServer2 {
  constructor(
    @inject.config('host') public host?: string,
    @inject.config('port') public port?: number,
  ) {}
}

describe('Context bindings - injecting configuration for bound artifacts', () => {
  it('binds configuration independent of binding', async () => {
    const ctx = new Context();

    // Bind configuration
    ctx.configure('servers.rest.server1').to({port: 3000});

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
      .configure('servers.rest.server1')
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
    ctx.configure('servers.rest').to({server1: {port: 3000}});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.config).to.eql({port: 3000});
  });

  it('binds configuration for environments', async () => {
    const ctx = new Context();

    ctx.bind('$environment').to('test');
    // Bind configuration
    ctx.configure('servers.rest.server1', 'dev').to({port: 4000});
    ctx.configure('servers.rest.server1', 'test').to({port: 3000});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');

    expect(server1.config).to.eql({port: 3000});
  });

  it('binds configuration for environments with defaults', async () => {
    const ctx = new Context();

    ctx.bind(ENVIRONMENT_KEY).to('dev');
    // Bind configuration
    ctx.configure('servers.rest.server1', 'dev').to({port: 4000});
    ctx.configure('servers.rest.server1', 'test').to({port: 3000});
    ctx.configure('servers.rest.server1').to({host: 'localhost'});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer2);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer2>('servers.rest.server1');

    expect(server1.host).to.eql('localhost');
    expect(server1.port).to.eql(4000);
  });
});
