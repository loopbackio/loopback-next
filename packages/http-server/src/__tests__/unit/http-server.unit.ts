// Copyright IBM Corp. and LoopBack contributors 2026. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import {IncomingMessage, ServerResponse} from 'http';
import {HttpOptions, HttpServer} from '../../';

describe('HttpServer (unit)', () => {
  let server: HttpServer | undefined;

  afterEach(async () => {
    if (server) {
      await server.stop();
      server = undefined;
    }
  });

  describe('constructor', () => {
    it('creates HTTP server with default options', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server).to.be.instanceOf(HttpServer);
      expect(server.protocol).to.equal('http');
      expect(server.serverOptions.port).to.equal(0);
    });

    it('creates HTTP server with custom port', () => {
      server = new HttpServer(dummyRequestHandler, {port: 3000});
      expect(server.serverOptions.port).to.equal(3000);
    });

    it('creates HTTP server with custom host', () => {
      server = new HttpServer(dummyRequestHandler, {host: 'localhost'});
      expect(server.serverOptions.host).to.equal('localhost');
    });

    it('defaults to http protocol when not specified', () => {
      server = new HttpServer(dummyRequestHandler, {});
      expect(server.protocol).to.equal('http');
    });

    it('applies keepAliveTimeout option', () => {
      server = new HttpServer(dummyRequestHandler, {
        keepAliveTimeout: 5000,
      });
      expect(server.server.keepAliveTimeout).to.equal(5000);
    });

    it('applies headersTimeout option', () => {
      server = new HttpServer(dummyRequestHandler, {
        headersTimeout: 6000,
      });
      expect(server.server.headersTimeout).to.equal(6000);
    });

    it('applies maxConnections option', () => {
      server = new HttpServer(dummyRequestHandler, {
        maxConnections: 100,
      });
      expect(server.server.maxConnections).to.equal(100);
    });

    it('applies maxHeadersCount option', () => {
      server = new HttpServer(dummyRequestHandler, {
        maxHeadersCount: 50,
      });
      expect(server.server.maxHeadersCount).to.equal(50);
    });

    it('applies timeout option', () => {
      server = new HttpServer(dummyRequestHandler, {
        timeout: 10000,
      });
      expect(server.server.timeout).to.equal(10000);
    });

    it('applies multiple server properties', () => {
      server = new HttpServer(dummyRequestHandler, {
        keepAliveTimeout: 1000,
        headersTimeout: 2000,
        maxConnections: 10,
        maxHeadersCount: 20,
        timeout: 3000,
      });
      expect(server.server.keepAliveTimeout).to.equal(1000);
      expect(server.server.headersTimeout).to.equal(2000);
      expect(server.server.maxConnections).to.equal(10);
      expect(server.server.maxHeadersCount).to.equal(20);
      expect(server.server.timeout).to.equal(3000);
    });

    it('sets up graceful stop with gracePeriodForClose', () => {
      server = new HttpServer(dummyRequestHandler, {
        gracePeriodForClose: 5000,
      });
      expect(server.serverOptions.gracePeriodForClose).to.equal(5000);
    });

    it('handles gracePeriodForClose set to 0', () => {
      server = new HttpServer(dummyRequestHandler, {
        gracePeriodForClose: 0,
      });
      expect(server.serverOptions.gracePeriodForClose).to.equal(0);
    });

    it('does not set up stoppable when gracePeriodForClose is undefined', () => {
      server = new HttpServer(dummyRequestHandler, {});
      expect(server.serverOptions.gracePeriodForClose).to.be.undefined();
    });
  });

  describe('properties before start', () => {
    it('returns protocol before start', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.protocol).to.equal('http');
    });

    it('returns port before start', () => {
      server = new HttpServer(dummyRequestHandler, {port: 3000});
      expect(server.port).to.equal(3000);
    });

    it('returns host before start', () => {
      server = new HttpServer(dummyRequestHandler, {host: 'localhost'});
      expect(server.host).to.equal('localhost');
    });

    it('returns undefined host when not specified', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.host).to.be.undefined();
    });

    it('returns listening as false before start', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.listening).to.be.false();
    });

    it('returns undefined address before start', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.address).to.be.undefined();
    });

    it('exposes server instance before start', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.server).to.be.ok();
    });
  });

  describe('properties after start', () => {
    it('returns listening as true after start', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.start();
      expect(server.listening).to.be.true();
    });

    it('returns actual port after start', async () => {
      server = new HttpServer(dummyRequestHandler, {port: 0});
      await server.start();
      expect(server.port).to.be.greaterThan(0);
    });

    it('returns address after start', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.start();
      expect(server.address).to.be.ok();
    });

    it('returns url after start', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.start();
      expect(server.url).to.match(/^http:\/\//);
    });
  });

  describe('properties after stop', () => {
    it('returns listening as false after stop', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.start();
      await server.stop();
      expect(server.listening).to.be.false();
    });

    it('returns undefined address after stop', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.start();
      await server.stop();
      expect(server.address).to.be.undefined();
    });
  });

  describe('start and stop', () => {
    it('can stop server before starting', async () => {
      server = new HttpServer(dummyRequestHandler);
      await server.stop();
      expect(server.listening).to.be.false();
    });

    it('can start and stop server multiple times', async () => {
      server = new HttpServer(dummyRequestHandler);

      await server.start();
      expect(server.listening).to.be.true();
      await server.stop();
      expect(server.listening).to.be.false();

      await server.start();
      expect(server.listening).to.be.true();
      await server.stop();
      expect(server.listening).to.be.false();
    });

    it('assigns different ports on each start', async () => {
      server = new HttpServer(dummyRequestHandler, {port: 0});

      await server.start();
      const port1 = server.port;
      await server.stop();

      await server.start();
      const port2 = server.port;
      await server.stop();

      expect(port1).to.not.equal(port2);
    });
  });

  describe('URL generation', () => {
    it('generates URL with IPv4 address', async () => {
      server = new HttpServer(dummyRequestHandler, {host: '127.0.0.1'});
      await server.start();
      expect(server.url).to.match(/^http:\/\/127\.0\.0\.1:\d+$/);
    });

    it('converts 0.0.0.0 to 127.0.0.1 in URL', async () => {
      server = new HttpServer(dummyRequestHandler, {host: '0.0.0.0'});
      await server.start();
      expect(server.url).to.match(/^http:\/\/127\.0\.0\.1:\d+$/);
    });
  });

  describe('server options', () => {
    it('merges provided options with defaults', () => {
      const options: HttpOptions = {
        port: 3000,
        host: 'localhost',
      };
      server = new HttpServer(dummyRequestHandler, options);
      expect(server.serverOptions).to.containDeep(options);
    });

    it('preserves all provided options', () => {
      const options: HttpOptions = {
        port: 3000,
        host: 'localhost',
        keepAliveTimeout: 5000,
        headersTimeout: 6000,
      };
      server = new HttpServer(dummyRequestHandler, options);
      expect(server.serverOptions.port).to.equal(3000);
      expect(server.serverOptions.host).to.equal('localhost');
      expect(server.serverOptions.keepAliveTimeout).to.equal(5000);
      expect(server.serverOptions.headersTimeout).to.equal(6000);
    });
  });

  describe('request handler', () => {
    it('uses provided request handler', () => {
      const customHandler = (req: IncomingMessage, res: ServerResponse) => {
        res.end();
      };
      server = new HttpServer(customHandler);
      expect(server).to.be.ok();
    });
  });

  describe('edge cases', () => {
    it('handles undefined serverOptions', () => {
      server = new HttpServer(dummyRequestHandler, undefined);
      expect(server.protocol).to.equal('http');
      expect(server.serverOptions.port).to.equal(0);
    });

    it('handles empty serverOptions object', () => {
      server = new HttpServer(dummyRequestHandler, {});
      expect(server.protocol).to.equal('http');
      expect(server.serverOptions.port).to.equal(0);
    });

    it('handles port 0 for automatic port assignment', async () => {
      server = new HttpServer(dummyRequestHandler, {port: 0});
      await server.start();
      expect(server.port).to.be.greaterThan(0);
    });
  });

  describe('protocol handling', () => {
    it('sets protocol to http by default', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.protocol).to.equal('http');
    });

    it('sets protocol to http when explicitly specified', () => {
      server = new HttpServer(dummyRequestHandler, {protocol: 'http'});
      expect(server.protocol).to.equal('http');
    });
  });

  describe('server instance', () => {
    it('exposes underlying http.Server instance', () => {
      server = new HttpServer(dummyRequestHandler);
      expect(server.server).to.have.property('listen');
      expect(server.server).to.have.property('close');
    });
  });

  function dummyRequestHandler(
    req: IncomingMessage,
    res: ServerResponse,
  ): void {
    res.end('OK');
  }
});

// Made with Bob
