// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {HttpServer} from '../../';
import {supertest, expect} from '@loopback/testlab';
import * as makeRequest from 'request-promise-native';
import {ServerRequest, ServerResponse, get, IncomingMessage} from 'http';

describe('HttpServer (integration)', () => {
  let server: HttpServer | undefined;

  afterEach(stopServer);

  process.env.TRAVIS
    ? // tslint:disable-next-line:no-unused-expression
      it.skip
    : it('formats IPv6 url correctly', async () => {
        server = new HttpServer(dummyRequestHandler, {host: '::1'});
        await server.start();
        expect(server.address!.family).to.equal('IPv6');
        const response = await getAsync(server.url);
        expect(response.statusCode).to.equal(200);
      });

  it('starts server', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    supertest(server.url)
      .get('/')
      .expect(200);
  });

  it('stops server', async () => {
    // Explicitly setting host to IPv4 address so test runs on Travis
    server = new HttpServer(dummyRequestHandler, {host: '127.0.0.1'});
    await server.start();
    await server.stop();
    await expect(
      makeRequest({
        uri: server.url,
      }),
    ).to.be.rejectedWith(/ECONNREFUSED/);
  });

  it('exports original port', async () => {
    server = new HttpServer(dummyRequestHandler, {port: 0});
    expect(server)
      .to.have.property('port')
      .which.is.equal(0);
  });

  it('exports reported port', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('port')
      .which.is.a.Number()
      .which.is.greaterThan(0);
  });

  it('does not permanently bind to the initial port', async () => {
    server = new HttpServer(dummyRequestHandler);
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
    server = new HttpServer(dummyRequestHandler);
    expect(server)
      .to.have.property('host')
      .which.is.equal(undefined);
  });

  it('exports reported host', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('host')
      .which.is.a.String();
  });

  it('exports protocol', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('protocol')
      .which.is.a.String()
      .match(/http|https/);
  });

  it('exports url', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('url')
      .which.is.a.String()
      .match(/http|https\:\/\//);
  });

  it('exports address', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('address')
      .which.is.an.Object();
  });

  it('resets address when server is stopped', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('address')
      .which.is.an.Object();
    await server.stop();
    expect(server.address).to.be.undefined();
  });

  it('exports started', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server.listening).to.be.true();
    await server.stop();
    expect(server.listening).to.be.false();
  });

  it('reports error when the server cannot be started', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.start();
    const port = server.port;
    const anotherServer = new HttpServer(dummyRequestHandler, {port: port});
    expect(anotherServer.start()).to.be.rejectedWith(/EADDRINUSE/);
  });

  function dummyRequestHandler(req: ServerRequest, res: ServerResponse): void {
    res.end();
  }

  async function stopServer() {
    if (!server) return;
    await server.stop();
  }

  function getAsync(url: string): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
      get(url, resolve).on('error', reject);
    });
  }
});
