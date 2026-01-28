// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {Server} from '../..';

describe('Server interface', () => {
  describe('type checking', () => {
    it('accepts object with listening property and lifecycle methods', () => {
      const server: Server = {
        listening: false,
        async start() {},
        async stop() {},
      };

      expect(server.listening).to.be.false();
      expect(server.start).to.be.a.Function();
      expect(server.stop).to.be.a.Function();
    });

    it('accepts object with only start method', () => {
      const server: Server = {
        listening: false,
        async start() {},
      };

      expect(server.listening).to.be.false();
      expect(server.start).to.be.a.Function();
    });

    it('accepts object with only stop method', () => {
      const server: Server = {
        listening: false,
        async stop() {},
      };

      expect(server.listening).to.be.false();
      expect(server.stop).to.be.a.Function();
    });

    it('accepts object with init method', () => {
      const server: Server = {
        listening: false,
        async init() {},
      };

      expect(server.listening).to.be.false();
      expect(server.init).to.be.a.Function();
    });

    it('accepts object with all lifecycle methods', () => {
      const server: Server = {
        listening: false,
        async init() {},
        async start() {},
        async stop() {},
      };

      expect(server.listening).to.be.false();
      expect(server.init).to.be.a.Function();
      expect(server.start).to.be.a.Function();
      expect(server.stop).to.be.a.Function();
    });
  });

  describe('listening property', () => {
    it('is readonly', () => {
      const server: Server = {
        listening: false,
      };

      // TypeScript enforces readonly at compile time
      // At runtime, we can verify the property exists
      expect(server).to.have.property('listening');
    });

    it('can be true', () => {
      const server: Server = {
        listening: true,
      };

      expect(server.listening).to.be.true();
    });

    it('can be false', () => {
      const server: Server = {
        listening: false,
      };

      expect(server.listening).to.be.false();
    });
  });

  describe('lifecycle methods', () => {
    it('init can be synchronous', () => {
      const server: Server = {
        listening: false,
        init() {},
      };

      expect(server.init).to.be.a.Function();
    });

    it('init can be asynchronous', () => {
      const server: Server = {
        listening: false,
        async init() {},
      };

      expect(server.init).to.be.a.Function();
    });

    it('init can return Promise<void>', () => {
      const server: Server = {
        listening: false,
        init(): Promise<void> {
          return Promise.resolve();
        },
      };

      expect(server.init).to.be.a.Function();
    });

    it('start can be synchronous', () => {
      const server: Server = {
        listening: false,
        start() {},
      };

      expect(server.start).to.be.a.Function();
    });

    it('start can be asynchronous', () => {
      const server: Server = {
        listening: false,
        async start() {},
      };

      expect(server.start).to.be.a.Function();
    });

    it('start can return Promise<void>', () => {
      const server: Server = {
        listening: false,
        start(): Promise<void> {
          return Promise.resolve();
        },
      };

      expect(server.start).to.be.a.Function();
    });

    it('stop can be synchronous', () => {
      const server: Server = {
        listening: false,
        stop() {},
      };

      expect(server.stop).to.be.a.Function();
    });

    it('stop can be asynchronous', () => {
      const server: Server = {
        listening: false,
        async stop() {},
      };

      expect(server.stop).to.be.a.Function();
    });

    it('stop can return Promise<void>', () => {
      const server: Server = {
        listening: false,
        stop(): Promise<void> {
          return Promise.resolve();
        },
      };

      expect(server.stop).to.be.a.Function();
    });

    it('lifecycle methods can accept injected arguments', () => {
      const server: Server = {
        listening: false,
        init(...args: unknown[]) {},
        start(...args: unknown[]) {},
        stop(...args: unknown[]) {},
      };

      expect(server.init).to.be.a.Function();
      expect(server.start).to.be.a.Function();
      expect(server.stop).to.be.a.Function();
    });
  });

  describe('class implementation', () => {
    it('can be implemented by a class', () => {
      class MyServer implements Server {
        listening = false;

        async start() {
          this.listening = true;
        }

        async stop() {
          this.listening = false;
        }
      }

      const server = new MyServer();
      expect(server).to.be.instanceOf(MyServer);
      expect(server.listening).to.be.false();
    });

    it('class can have additional properties', () => {
      class MyServer implements Server {
        listening = false;
        port = 3000;
        host = 'localhost';

        async start() {
          this.listening = true;
        }

        async stop() {
          this.listening = false;
        }
      }

      const server = new MyServer();
      expect(server.port).to.equal(3000);
      expect(server.host).to.equal('localhost');
    });

    it('class can have additional methods', () => {
      class MyServer implements Server {
        listening = false;

        async start() {
          this.listening = true;
        }

        async stop() {
          this.listening = false;
        }

        getStatus() {
          return this.listening ? 'running' : 'stopped';
        }
      }

      const server = new MyServer();
      expect(server.getStatus()).to.equal('stopped');
    });

    it('class can implement all lifecycle methods', () => {
      class MyServer implements Server {
        listening = false;
        initialized = false;

        async init() {
          this.initialized = true;
        }

        async start() {
          this.listening = true;
        }

        async stop() {
          this.listening = false;
        }
      }

      const server = new MyServer();
      expect(server.initialized).to.be.false();
      expect(server.listening).to.be.false();
    });
  });

  describe('functional behavior', () => {
    it('server can track listening state', async () => {
      class MyServer implements Server {
        listening = false;

        async start() {
          this.listening = true;
        }

        async stop() {
          this.listening = false;
        }
      }

      const server = new MyServer();
      expect(server.listening).to.be.false();

      await server.start();
      expect(server.listening).to.be.true();

      await server.stop();
      expect(server.listening).to.be.false();
    });

    it('server can perform initialization', async () => {
      const events: string[] = [];

      class MyServer implements Server {
        listening = false;

        async init() {
          events.push('init');
        }

        async start() {
          events.push('start');
          this.listening = true;
        }

        async stop() {
          events.push('stop');
          this.listening = false;
        }
      }

      const server = new MyServer();
      await server.init?.();
      await server.start();
      await server.stop();

      expect(events).to.eql(['init', 'start', 'stop']);
    });

    it('server can handle errors in lifecycle methods', async () => {
      class MyServer implements Server {
        listening = false;

        async start() {
          throw new Error('Start failed');
        }

        async stop() {
          this.listening = false;
        }
      }

      const server = new MyServer();
      await expect(server.start()).to.be.rejectedWith('Start failed');
    });

    it('server can manage resources', async () => {
      class MyServer implements Server {
        listening = false;
        private resources: string[] = [];

        async start() {
          this.resources.push('resource1');
          this.resources.push('resource2');
          this.listening = true;
        }

        async stop() {
          this.resources = [];
          this.listening = false;
        }

        getResourceCount() {
          return this.resources.length;
        }
      }

      const server = new MyServer();
      expect(server.getResourceCount()).to.equal(0);

      await server.start();
      expect(server.getResourceCount()).to.equal(2);

      await server.stop();
      expect(server.getResourceCount()).to.equal(0);
    });
  });

  describe('integration scenarios', () => {
    it('multiple servers can coexist', async () => {
      class HttpServer implements Server {
        listening = false;
        async start() {
          this.listening = true;
        }
        async stop() {
          this.listening = false;
        }
      }

      class WebSocketServer implements Server {
        listening = false;
        async start() {
          this.listening = true;
        }
        async stop() {
          this.listening = false;
        }
      }

      const httpServer = new HttpServer();
      const wsServer = new WebSocketServer();

      await httpServer.start();
      await wsServer.start();

      expect(httpServer.listening).to.be.true();
      expect(wsServer.listening).to.be.true();

      await httpServer.stop();
      await wsServer.stop();

      expect(httpServer.listening).to.be.false();
      expect(wsServer.listening).to.be.false();
    });

    it('server can be started and stopped multiple times', async () => {
      class MyServer implements Server {
        listening = false;
        startCount = 0;
        stopCount = 0;

        async start() {
          this.startCount++;
          this.listening = true;
        }

        async stop() {
          this.stopCount++;
          this.listening = false;
        }
      }

      const server = new MyServer();

      await server.start();
      await server.stop();
      await server.start();
      await server.stop();

      expect(server.startCount).to.equal(2);
      expect(server.stopCount).to.equal(2);
    });
  });
});

// Made with Bob
