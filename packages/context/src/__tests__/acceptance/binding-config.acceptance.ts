// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {config, configBindingKeyFor, Context, ContextView, Getter} from '../..';

describe('Context bindings - injecting configuration for bound artifacts', () => {
  let ctx: Context;

  beforeEach(givenContext);

  it('binds configuration independent of binding', async () => {
    // Bind configuration
    ctx.configure('servers.rest.server1').to({port: 3000});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');

    expect(server1.configObj).to.eql({port: 3000});
  });

  it('configures an artifact with a dynamic source', async () => {
    // Bind configuration
    ctx
      .configure('servers.rest.server1')
      .toDynamicValue(() => Promise.resolve({port: 3000}));

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.configObj).to.eql({port: 3000});
  });

  it('configures an artifact with alias', async () => {
    // Configure rest server 1 to reference `rest` property of the application
    // configuration
    ctx
      .configure('servers.rest.server1')
      .toAlias(configBindingKeyFor('application', 'rest'));

    // Configure the application
    ctx.configure('application').to({rest: {port: 3000}});

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServer);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServer>('servers.rest.server1');
    expect(server1.configObj).to.eql({port: 3000});
  });

  it('allows configPath for injection', async () => {
    class RestServerWithPort {
      constructor(@config('port') public port: number) {}
    }

    // Bind configuration
    ctx
      .configure('servers.rest.server1')
      .toDynamicValue(() => Promise.resolve({port: 3000}));

    // Bind RestServer
    ctx.bind('servers.rest.server1').toClass(RestServerWithPort);

    // Resolve an instance of RestServer
    // Expect server1.config to be `{port: 3000}
    const server1 = await ctx.get<RestServerWithPort>('servers.rest.server1');
    expect(server1.port).to.eql(3000);
  });

  const LOGGER_KEY = 'loggers.Logger';
  it('injects a getter function to access config', async () => {
    class Logger {
      constructor(
        @config.getter()
        public configGetter: Getter<LoggerConfig | undefined>,
      ) {}
    }

    // Bind logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'INFO'});

    // Bind Logger
    ctx.bind(LOGGER_KEY).toClass(Logger);

    const logger = await ctx.get<Logger>(LOGGER_KEY);
    let configObj = await logger.configGetter();
    expect(configObj).to.eql({level: 'INFO'});

    // Update logger configuration
    const configBinding = ctx.configure(LOGGER_KEY).to({level: 'DEBUG'});

    configObj = await logger.configGetter();
    expect(configObj).to.eql({level: 'DEBUG'});

    // Now remove the logger configuration
    ctx.unbind(configBinding.key);

    // configGetter returns undefined as config is optional by default
    configObj = await logger.configGetter();
    expect(configObj).to.be.undefined();
  });

  it('injects a view to access config', async () => {
    class Logger {
      constructor(
        @config.view()
        public configView: ContextView<LoggerConfig>,
      ) {}
    }

    // Bind logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'INFO'});

    // Bind Logger
    ctx.bind(LOGGER_KEY).toClass(Logger);

    const logger = await ctx.get<Logger>(LOGGER_KEY);
    let configObj = await logger.configView.singleValue();
    expect(configObj).to.eql({level: 'INFO'});

    // Update logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'DEBUG'});

    configObj = await logger.configView.singleValue();
    expect(configObj).to.eql({level: 'DEBUG'});
  });

  it('injects a view to access config with path', async () => {
    class Logger {
      constructor(
        @config.view('level')
        public configView: ContextView<string>,
      ) {}
    }

    // Bind logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'INFO'});

    // Bind Logger
    ctx.bind(LOGGER_KEY).toClass(Logger);

    const logger = await ctx.get<Logger>(LOGGER_KEY);
    let level = await logger.configView.singleValue();
    expect(level).to.eql('INFO');

    // Update logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'DEBUG'});

    level = await logger.configView.singleValue();
    expect(level).to.eql('DEBUG');
  });

  it('rejects injection of config view if the target type is not ContextView', async () => {
    class Logger {
      constructor(
        @config.view()
        public configView: object,
      ) {}
    }

    // Bind logger configuration
    ctx.configure(LOGGER_KEY).to({level: 'INFO'});

    // Bind Logger
    ctx.bind(LOGGER_KEY).toClass(Logger);

    await expect(ctx.get<Logger>(LOGGER_KEY)).to.be.rejectedWith(
      'The type of Logger.constructor[0] (Object) is not ContextView',
    );
  });

  function givenContext() {
    ctx = new Context();
  }

  interface RestServerConfig {
    host?: string;
    port?: number;
  }

  class RestServer {
    constructor(@config() public configObj: RestServerConfig) {}
  }

  interface LoggerConfig {
    level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  }
});
