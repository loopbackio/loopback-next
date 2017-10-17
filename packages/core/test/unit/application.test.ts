// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Application, Server, Component} from '../../index';
import {Context, Constructor} from '@loopback/context';

describe('Application', () => {
  describe('server binding', () => {
    it('defaults to constructor name', async () => {
      const app = new Application();
      app.server(FakeServer);
      const result = await app.getServer(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('allows custom name', async () => {
      const app = new Application();
      const name = 'customName';
      app.server(FakeServer, name);
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    it('works synchronously', () => {
      const app = new Application();
      app.server(FakeServer);
      const result = app.getServerSync(FakeServer.name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });
  });

  describe('configuration', () => {
    it('allows servers to be provided via config', async () => {
      const name = 'abc123';
      const app = new Application({
        servers: {
          abc123: FakeServer,
        },
      });
      const result = await app.getServer(name);
      expect(result.constructor.name).to.equal(FakeServer.name);
    });

    describe('start', () => {
      it('starts all injected servers', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        await app.start();
        const server = await app.getServer(FakeServer);
        expect(server).to.not.be.null();
        expect(server.running).to.equal(true);
        await app.stop();
      });

      it('does not attempt to start poorly named bindings', async () => {
        const app = new Application({
          components: [FakeComponent],
        });

        // The app.start should not attempt to start this binding.
        app.bind('controllers.servers').to({});
        await app.start();
        await app.stop();
      });
    });
  });
});

class FakeComponent implements Component {
  servers: {
    [name: string]: Constructor<Server>;
  };
  constructor() {
    this.servers = {
      FakeServer,
      FakeServer2: FakeServer,
    };
  }
}

class FakeServer extends Context implements Server {
  running: boolean = false;
  constructor() {
    super();
  }
  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }
}
