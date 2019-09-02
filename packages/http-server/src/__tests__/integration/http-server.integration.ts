// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  expect,
  givenHttpServerConfig,
  httpGetAsync,
  httpsGetAsync,
  skipOnTravis,
  supertest,
} from '@loopback/testlab';
import * as fs from 'fs';
import {IncomingMessage, Server, ServerResponse} from 'http';
import * as os from 'os';
import * as path from 'path';
import {HttpOptions, HttpServer, HttpsOptions} from '../../';

describe('HttpServer (integration)', () => {
  let server: HttpServer | undefined;

  afterEach(stopServer);

  skipOnTravis(it, 'formats IPv6 url correctly', async () => {
    server = new HttpServer(dummyRequestHandler, {
      host: '::1',
    } as HttpOptions);
    await server.start();
    expect(getAddressFamily(server)).to.equal('IPv6');
    const response = await httpGetAsync(server.url);
    expect(response.statusCode).to.equal(200);
  });

  it('starts server', async () => {
    const serverOptions = givenHttpServerConfig();
    server = new HttpServer(dummyRequestHandler, serverOptions);
    await server.start();
    await supertest(server.url)
      .get('/')
      .expect(200);
  });

  it('stops server', async () => {
    const serverOptions = givenHttpServerConfig();
    server = new HttpServer(dummyRequestHandler, serverOptions);
    await server.start();
    await server.stop();
    await expect(httpGetAsync(server.url)).to.be.rejectedWith(/ECONNREFUSED/);
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

  it('exports server before start', async () => {
    server = new HttpServer(dummyRequestHandler);
    expect(server.server).to.be.instanceOf(Server);
  });

  it('stops server before start', async () => {
    server = new HttpServer(dummyRequestHandler);
    await server.stop();
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

  it('exports listening', async () => {
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
    const anotherServer = new HttpServer(dummyRequestHandler, {
      port: port,
    });
    await expect(anotherServer.start()).to.be.rejectedWith(/EADDRINUSE/);
  });

  it('supports HTTP over IPv4', async () => {
    server = new HttpServer(dummyRequestHandler, {host: '127.0.0.1'});
    await server.start();
    expect(getAddressFamily(server)).to.equal('IPv4');
    const response = await httpGetAsync(server.url);
    expect(response.statusCode).to.equal(200);
  });

  skipOnTravis(it, 'supports HTTP over IPv6', async () => {
    server = new HttpServer(dummyRequestHandler, {host: '::1'});
    await server.start();
    expect(getAddressFamily(server)).to.equal('IPv6');
    const response = await httpGetAsync(server.url);
    expect(response.statusCode).to.equal(200);
  });

  it('supports HTTPS protocol with key and certificate files', async () => {
    const serverOptions = givenHttpServerConfig();
    const httpsServer: HttpServer = givenHttpsServer(serverOptions);
    await httpsServer.start();
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  it('supports HTTPS protocol with a pfx file', async () => {
    const httpsServer: HttpServer = givenHttpsServer({usePfx: true});
    await httpsServer.start();
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  skipOnTravis(it, 'handles IPv6 loopback address in HTTPS', async () => {
    const httpsServer: HttpServer = givenHttpsServer({
      host: '::1',
    });
    await httpsServer.start();
    expect(getAddressFamily(httpsServer)).to.equal('IPv6');
    const response = await httpsGetAsync(httpsServer.url);
    expect(response.statusCode).to.equal(200);
  });

  it('converts host from [::] to [::1] in url', async () => {
    // Safari on MacOS does not support http://[::]:3000/
    server = new HttpServer(dummyRequestHandler, {host: '::'});
    await server.start();
    expect(server.url).to.equal(`http://[::1]:${server.port}`);
  });

  it('converts host from 0.0.0.0 to 127.0.0.1 in url', async () => {
    // Windows does not support http://0.0.0.0:3000/
    server = new HttpServer(dummyRequestHandler, {host: '0.0.0.0'});
    await server.start();
    expect(server.url).to.equal(`http://127.0.0.1:${server.port}`);
  });

  it('supports HTTP over unix socket', async () => {
    if (os.platform() === 'win32') return;
    const socketPath = path.join(os.tmpdir(), 'test.sock');
    server = new HttpServer(dummyRequestHandler, {
      path: socketPath,
    });
    await server.start();
    expect(getAddressFamily(server)).to.equal('ipc');
    expect(server.address).to.eql(socketPath);
    expect(server.host).to.be.undefined();
    expect(server.port).to.eql(0);
    expect(server.url).to.eql('http+unix://' + encodeURIComponent(socketPath));
    await supertest(server.url)
      .get('/')
      .expect(200);
  });

  it('supports HTTP over Windows named pipe', async () => {
    if (os.platform() !== 'win32') return;
    const namedPipe = path.join('\\\\?\\pipe', process.cwd(), 'test.pipe');
    server = new HttpServer(dummyRequestHandler, {
      path: namedPipe,
    });
    await server.start();
    expect(getAddressFamily(server)).to.equal('ipc');
    expect(server.url).to.eql(namedPipe);
  });

  it('rejects invalid named pipe on Windows', async () => {
    if (os.platform() !== 'win32') return;
    const namedPipe = 'test.pipe';
    expect(() => {
      server = new HttpServer(dummyRequestHandler, {
        path: namedPipe,
      });
    }).to.throw(/Named pipe test\.pipe does NOT start with/);
  });

  function getAddressFamily(httpServer: HttpServer) {
    if (!httpServer || !httpServer.address) return undefined;
    if (typeof httpServer.address === 'string') {
      return 'ipc';
    }
    return httpServer.address.family;
  }

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

  function givenHttpsServer({
    usePfx,
    host,
  }: {
    usePfx?: boolean;
    host?: string;
  }): HttpServer {
    const options = givenHttpServerConfig<HttpsOptions>({
      protocol: 'https',
      host,
    });
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
    return new HttpServer(dummyRequestHandler, options);
  }
});
