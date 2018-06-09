// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
import {HttpServer} from '../../';
import {supertest, expect} from '@loopback/testlab';
import * as makeRequest from 'request-promise-native';
import {ServerRequest, ServerResponse} from 'http';

describe('HttpServer (integration)', () => {
  it('starts server', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    supertest(server.url)
      .get('/')
      .expect(200);
    await server.stop();
  });

  it('stops server', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    await server.stop();
    await expect(
      makeRequest({
        uri: server.url,
      }),
    ).to.be.rejectedWith(/ECONNREFUSED/);
  });

  it('exports original port', async () => {
    const server = new HttpServer(dummyRequestHandler, {port: 0});
    expect(server)
      .to.have.property('port')
      .which.is.equal(0);
  });

  it('exports reported port', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('port')
      .which.is.a.Number()
      .which.is.greaterThan(0);
    await server.stop();
  });

  it('does not permanently bind to the initial port', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    const port = server.port;
    await server.stop();
    await server.start();
    expect(server)
      .to.have.property('port')
      .which.is.a.Number()
      .which.is.not.equal(port);
    await server.stop();
  });

  it('exports original host', async () => {
    const server = new HttpServer(dummyRequestHandler);
    expect(server)
      .to.have.property('host')
      .which.is.equal(undefined);
  });

  it('exports reported host', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('host')
      .which.is.a.String();
    await server.stop();
  });

  it('exports protocol', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('protocol')
      .which.is.a.String()
      .match(/http|https/);
    await server.stop();
  });

  it('exports url', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('url')
      .which.is.a.String()
      .match(/http|https\:\/\//);
    await server.stop();
  });

  it('exports address', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server)
      .to.have.property('address')
      .which.is.an.Object();
    await server.stop();
  });

  it('exports started', async () => {
    const server = new HttpServer(dummyRequestHandler);
    await server.start();
    expect(server.started).to.be.true();
    await server.stop();
    expect(server.started).to.be.false();
  });

  it('start() returns a rejected promise', async () => {
    const serverA = new HttpServer(dummyRequestHandler);
    await serverA.start();
    const port = serverA.port;
    const serverB = new HttpServer(dummyRequestHandler, {port: port});
    expect(serverB.start()).to.be.rejectedWith(/EADDRINUSE/);
  });

  function dummyRequestHandler(req: ServerRequest, res: ServerResponse): void {
    res.end();
  }
});
