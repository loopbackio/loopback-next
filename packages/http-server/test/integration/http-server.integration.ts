// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {
  expect,
  givenHttpServerConfig,
  httpGetAsync,
  httpsGetAsync,
  itSkippedOnTravis,
  supertest,
} from '@loopback/testlab';
import * as fs from 'fs';
import {IncomingMessage, Server, ServerResponse} from 'http';
import * as path from 'path';
import * as makeRequest from 'request-promise-native';
import {
  DefaultHttpServer,
  RequestListener,
  HttpOptions,
  HttpServer,
  HttpServerOptions,
  Http2Options,
  ProtocolServerFactory,
} from '../..';

import spdy = require('spdy');

describe('HttpServer (integration)', () => {
  let server: HttpServer | undefined;

  afterEach(stopServer);

  itSkippedOnTravis('formats IPv6 url correctly', async () => {
    server = givenHttpServer(dummyRequestHandler, {
      host: '::1',
    } as HttpOptions);
    await server.start();
    expect(server.address!.family).to.equal('IPv6');
    const response = await httpGetAsync(server.url);
    expect(response.statusCode).to.equal(200);
  });

  it('starts server', async () => {
    const serverOptions = givenHttpServerConfig();
    server = givenHttpServer(dummyRequestHandler, serverOptions);
    await server.start();
    await supertest(server.url)
      .get('/')
      .expect(200);
  });

  it('stops server', async () => {
    const serverOptions = givenHttpServerConfig();
    server = givenHttpServer(dummyRequestHandler, serverOptions);
    await server.start();
    await server.stop();
    await expect(
      makeRequest({
        uri: server.url,
      }),
    ).to.be.rejectedWith(/ECONNREFUSED/);
  });

  it('exports original port', async () => {
    server = givenHttpServer(dummyRequestHandler, {port: 0});
    expect(server)
      .to.have.property('port')
      .which.is.equal(0);
  });

  it('exports reported port', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('port')
      .which.is.a.Number()
      .which.is.greaterThan(0);
  });

  it('does not permanently bind to the initial port', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    const port = server.port;
    await server.stop();
    await server.start();
    expect(server)
      .to.have.property('port')
      .which.is.a.Number()
      .which.is.not.equal(port);
  });

  it('exports original host', async () => {
    server = givenHttpServer(dummyRequestHandler);
    expect(server)
      .to.have.property('host')
      .which.is.equal(undefined);
  });

  it('exports reported host', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('host')
      .which.is.a.String();
  });

  it('exports protocol', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('protocol')
      .which.is.a.String()
      .match(/http|https/);
  });

  it('exports url', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('url')
      .which.is.a.String()
      .match(/http|https\:\/\//);
  });

  it('exports address', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('address')
      .which.is.an.Object();
  });

  it('exports server before start', async () => {
    server = givenHttpServer(dummyRequestHandler);
    expect(server.server).to.be.instanceOf(Server);
  });

  it('resets address when server is stopped', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('address')
      .which.is.an.Object();
    await server.stop();
    expect(server.address).to.be.undefined();
  });

  it('exports listening', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    expect(server.listening).to.be.true();
    await server.stop();
    expect(server.listening).to.be.false();
  });

  it('reports error when the server cannot be started', async () => {
    server = givenHttpServer(dummyRequestHandler);
    await server.start();
    const port = server.port;
    const anotherServer = givenHttpServer(dummyRequestHandler, {
      port: port,
    });
    await expect(anotherServer.start()).to.be.rejectedWith(/EADDRINUSE/);
  });

  it('supports HTTPS protocol with key and certificate files', async () => {
    const serverOptions = givenHttpServerConfig();
    const httpsServer: HttpServer = givenHttpsServer(serverOptions);
    await httpsServer.start();
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  it('supports HTTPS protocol with a pfx file', async () => {
    const serverOptions = givenHttpServerConfig({
      usePfx: true,
    });
    const httpsServer: HttpServer = givenHttpsServer(serverOptions);
    await httpsServer.start();
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  itSkippedOnTravis('handles IPv6 loopback address in HTTPS', async () => {
    const httpsServer: HttpServer = givenHttpsServer({
      host: '::1',
    });
    await httpsServer.start();
    expect(httpsServer.address!.family).to.equal('IPv6');
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  it('converts host from [::] to [::1] in url', async () => {
    // Safari on MacOS does not support http://[::]:3000/
    server = givenHttpServer(dummyRequestHandler, {host: '::'});
    await server.start();
    expect(server.url).to.equal(`http://[::1]:${server.port}`);
  });

  it('converts host from 0.0.0.0 to 127.0.0.1 in url', async () => {
    // Windows does not support http://0.0.0.0:3000/
    server = givenHttpServer(dummyRequestHandler, {host: '0.0.0.0'});
    await server.start();
    expect(server.url).to.equal(`http://127.0.0.1:${server.port}`);
  });

  it('supports HTTP/2 protocol with key and certificate files', async () => {
    // For some reason, spdy fails with Node 11
    if (+process.versions.node.split('.')[0] > 10) return;
    const serverOptions: Http2Options = Object.assign(
      {
        // TypeScript infers `string` as the type for `protocol` and emits
        // a compilation error if we don't cast it as `http2`
        protocol: 'http2' as 'http2',
        rejectUnauthorized: false,
        spdy: {protocols: ['h2' as 'h2']},
      },
      givenHttpServerConfig(),
    );
    server = givenHttp2Server(serverOptions);
    await server.start();
    // http2 does not have its own url scheme
    expect(server.url).to.match(/^https\:/);
    const agent = spdy.createAgent({
      rejectUnauthorized: false,
      port: server.port,
      host: server.host,
      // Optional SPDY options
      spdy: {
        plain: false,
        ssl: true,
      },
    }) as spdy.Agent;
    const response = await httpsGetAsync(server.url, agent);
    expect(response.statusCode).to.equal(200);
    // We need to close the agent so that server.close() returns
    // `@types/spdy@3.x` is not fully compatible with `spdy@4.0.0`
    // tslint:disable-next-line:no-any
    (agent as any).close();
  });

  function dummyRequestHandler(
    req: IncomingMessage,
    res: ServerResponse,
  ): void {
    res.end();
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
  }

  function givenHttpServer(
    requestListener: RequestListener,
    serverOptions?: HttpServerOptions,
  ) {
    return new DefaultHttpServer(requestListener, serverOptions);
  }

  function givenHttpsServer({
    usePfx,
    host,
  }: {
    usePfx?: boolean;
    host?: string;
  }): HttpServer {
    const options: HttpServerOptions = {protocol: 'https', host};
    const certDir = path.resolve(__dirname, '../../../fixtures');
    if (usePfx) {
      const pfxPath = path.join(certDir, 'pfx.pfx');
      options.pfx = fs.readFileSync(pfxPath);
      options.passphrase = 'loopback4';
    } else {
      const keyPath = path.join(certDir, 'key.pem');
      const certPath = path.join(certDir, 'cert.pem');
      options.key = fs.readFileSync(keyPath);
      options.cert = fs.readFileSync(certPath);
    }
    return new DefaultHttpServer(dummyRequestHandler, options);
  }

  class Http2ProtocolServerFactory implements ProtocolServerFactory {
    supports(protocol: string, serverOptions: HttpServerOptions) {
      return protocol === 'http2' || serverOptions.hasOwnProperty('spdy');
    }

    createServer(
      protocol: string,
      requestListener: RequestListener,
      serverOptions: HttpServerOptions,
    ) {
      const http2Server = spdy.createServer(
        serverOptions as spdy.ServerOptions,
        requestListener,
      );
      return {server: http2Server, urlScheme: 'https'};
    }
  }

  function givenHttp2Server(options: Http2Options): HttpServer {
    const certDir = path.resolve(__dirname, '../../../fixtures');
    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');
    options.key = fs.readFileSync(keyPath);
    options.cert = fs.readFileSync(certPath);
    return new DefaultHttpServer(dummyRequestHandler, options, [
      new Http2ProtocolServerFactory(),
    ]);
  }
});
