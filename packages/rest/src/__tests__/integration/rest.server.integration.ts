// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {
  createClientForHandler,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
  httpsGetAsync,
  skipOnTravis,
  supertest,
} from '@loopback/testlab';
import * as fs from 'fs';
import {IncomingMessage, ServerResponse} from 'http';
import * as yaml from 'js-yaml';
import * as path from 'path';
import {is} from 'type-is';
import * as util from 'util';
import {
  BodyParser,
  get,
  post,
  Request,
  requestBody,
  RequestContext,
  RestApplication,
  RestBindings,
  RestComponent,
  RestServer,
  RestServerConfig,
} from '../..';
const readFileAsync = util.promisify(fs.readFile);

const FIXTURES = path.resolve(__dirname, '../../../fixtures');
const ASSETS = path.resolve(FIXTURES, 'assets');

describe('RestServer (integration)', () => {
  describe('url/rootUrl properties', () => {
    let server: RestServer;

    afterEach('shuts down server', async () => {
      if (!server) return;
      await server.stop();
      expect(server.url).to.be.undefined();
      expect(server.rootUrl).to.be.undefined();
    });

    describe('url', () => {
      it('exports url property', async () => {
        server = await givenAServer();
        server.handler(dummyRequestHandler);
        expect(server.url).to.be.undefined();
        await server.start();
        expect(server)
          .to.have.property('url')
          .which.is.a.String()
          .match(/http|https\:\/\//);
        await supertest(server.url)
          .get('/')
          .expect(200, 'Hello');
      });

      it('includes basePath in the url property', async () => {
        server = await givenAServer({rest: {basePath: '/api'}});
        server.handler(dummyRequestHandler);
        expect(server.url).to.be.undefined();
        await server.start();
        expect(server)
          .to.have.property('url')
          .which.is.a.String()
          .match(/http|https\:\/\//);
        expect(server.url).to.match(/api$/);
        await supertest(server.url)
          .get('/')
          .expect(200, 'Hello');
      });
    });

    describe('rootUrl', () => {
      it('exports rootUrl property', async () => {
        server = await givenAServer();
        server.handler(dummyRequestHandler);
        expect(server.rootUrl).to.be.undefined();
        await server.start();
        expect(server)
          .to.have.property('rootUrl')
          .which.is.a.String()
          .match(/http|https\:\/\//);
        await supertest(server.rootUrl)
          .get('/api')
          .expect(200, 'Hello');
      });

      it('does not include basePath in rootUrl', async () => {
        server = await givenAServer({rest: {basePath: '/api'}});
        server.handler(dummyRequestHandler);
        expect(server.rootUrl).to.be.undefined();
        await server.start();
        expect(server)
          .to.have.property('rootUrl')
          .which.is.a.String()
          .match(/http|https\:\/\//);
        await supertest(server.rootUrl)
          .get('/api')
          .expect(200, 'Hello');
      });
    });
  });

  it('parses query without decorated rest query params', async () => {
    // This handler responds with the query object (which is expected to
    // be parsed by Express)
    function requestWithQueryHandler({request, response}: RequestContext) {
      response.json(request.query);
      response.end();
    }

    // See https://github.com/strongloop/loopback-next/issues/2088
    const server = await givenAServer();
    server.handler(requestWithQueryHandler);
    await server.start();
    await supertest(server.url)
      .get('/?x=1&y[a]=2')
      .expect(200, {x: '1', y: {a: '2'}});
    await server.stop();
  });

  it('updates rest.port binding when listening on ephemeral port', async () => {
    const server = await givenAServer();
    await server.start();
    expect(server.getSync(RestBindings.PORT)).to.be.above(0);
    await server.stop();
  });

  it('honors port binding after instantiation', async () => {
    const server = await givenAServer({rest: {port: 80}});
    server.bind(RestBindings.PORT).to(0);
    await server.start();
    expect(server.getSync(RestBindings.PORT)).to.not.equal(80);
    await server.stop();
  });

  it('disables listening if noListen is set to true', async () => {
    const server = await givenAServer({rest: {listenOnStart: false, port: 0}});
    await server.start();
    // No port is assigned
    expect(server.getSync(RestBindings.PORT)).to.eql(0);
    // No server url is set
    expect(server.url).to.be.undefined();
    expect(server.listening).to.be.false();
    await server.stop();
  });

  it('does not throw an error when stopping an app that has not been started', async () => {
    const server = await givenAServer();
    await expect(server.stop()).to.fulfilled();
  });

  it('responds with 500 when Sequence fails with unhandled error', async () => {
    const server = await givenAServer();
    server.handler((context, sequence) => {
      return Promise.reject(new Error('unhandled test error'));
    });

    // Temporarily disable Mocha's handling of uncaught exceptions
    const mochaListeners = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    process.once('uncaughtException', err => {
      expect(err).to.have.property('message', 'unhandled test error');
      for (const l of mochaListeners) {
        process.on('uncaughtException', l);
      }
    });

    return createClientForHandler(server.requestHandler)
      .get('/')
      .expect(500);
  });

  it('allows static assets to be mounted at /', async () => {
    const root = ASSETS;
    const server = await givenAServer({
      rest: {
        port: 0,
      },
    });

    expect(() => server.static('/', root)).to.not.throw();
    expect(() => server.static('', root)).to.not.throw();
    expect(() => server.static(['/'], root)).to.not.throw();
    expect(() => server.static(['/html', ''], root)).to.not.throw();
    expect(() => server.static(/.*/, root)).to.not.throw();
    expect(() => server.static('/(.*)', root)).to.not.throw();
  });

  it('allows static assets via api', async () => {
    const root = ASSETS;
    const server = await givenAServer();

    server.static('/html', root);
    const content = fs
      .readFileSync(path.join(root, 'index.html'))
      .toString('utf-8');
    await createClientForHandler(server.requestHandler)
      .get('/html/index.html')
      .expect('Content-Type', /text\/html/)
      .expect(200, content);
  });

  it('allows static assets to be mounted on multiple paths', async () => {
    const root = ASSETS;
    const server = await givenAServer();

    server.static('/html-0', root);
    server.static('/html-1', root);

    const content = fs
      .readFileSync(path.join(root, 'index.html'))
      .toString('utf-8');
    await createClientForHandler(server.requestHandler)
      .get('/html-0/index.html')
      .expect('Content-Type', /text\/html/)
      .expect(200, content);
    await createClientForHandler(server.requestHandler)
      .get('/html-1/index.html')
      .expect('Content-Type', /text\/html/)
      .expect(200, content);
  });

  it('merges different static asset directories when mounted on the same path', async () => {
    const root = ASSETS;
    const otherAssets = path.join(FIXTURES, 'other-assets');
    const server = await givenAServer();

    server.static('/html', root);
    server.static('/html', otherAssets);

    let content = await readFileFromDirectory(root, 'index.html');
    await createClientForHandler(server.requestHandler)
      .get('/html/index.html')
      .expect('Content-Type', /text\/html/)
      .expect(200, content);

    content = await readFileFromDirectory(otherAssets, 'robots.txt');
    await createClientForHandler(server.requestHandler)
      .get('/html/robots.txt')
      .expect('Content-Type', /text\/plain/)
      .expect(200, content);
  });

  it('allows static assets via api after start', async () => {
    const root = ASSETS;
    const server = await givenAServer();
    await createClientForHandler(server.requestHandler)
      .get('/html/index.html')
      .expect(404);

    server.static('/html', root);

    await createClientForHandler(server.requestHandler)
      .get('/html/index.html')
      .expect(200);
  });

  it('allows non-static routes after assets', async () => {
    const root = ASSETS;
    const server = await givenAServer();
    server.static('/html', root);
    server.handler(dummyRequestHandler);

    await createClientForHandler(server.requestHandler)
      .get('/html/does-not-exist.html')
      .expect(200, 'Hello');
  });

  it('gives precedence to API routes over static assets', async () => {
    const root = ASSETS;
    const server = await givenAServer();
    server.static('/html', root);
    server.handler(dummyRequestHandler);

    await createClientForHandler(server.requestHandler)
      .get('/html/index.html')
      .expect(200, 'Hello');
  });

  it('registers controllers defined later than static assets', async () => {
    const root = ASSETS;
    const server = await givenAServer();
    server.static('/html', root);
    server.controller(DummyController);

    await createClientForHandler(server.requestHandler)
      .get('/html')
      .expect(200, 'Hi');
  });

  it('allows request body parser extensions', async () => {
    const body = '<key>value</key>';

    /**
     * A mock-up xml parser
     */
    class XmlBodyParser implements BodyParser {
      name = 'xml';
      supports(mediaType: string) {
        return !!is(mediaType, 'xml');
      }

      async parse(request: Request) {
        return {value: {key: 'value'}};
      }
    }

    const server = await givenAServer();
    // Register a request body parser for xml
    server.bodyParser(XmlBodyParser);
    server.controller(DummyXmlController);

    await createClientForHandler(server.requestHandler)
      .post('/')
      .set('Content-Type', 'application/xml')
      .send(body)
      .expect(200, {key: 'value'});
  });

  it('allows cors', async () => {
    const server = await givenAServer();
    server.handler(dummyRequestHandler);

    await createClientForHandler(server.requestHandler)
      .get('/')
      .expect(200, 'Hello')
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Credentials', 'true');
  });

  it('allows cors preflight', async () => {
    const server = await givenAServer();
    server.handler(dummyRequestHandler);

    await createClientForHandler(server.requestHandler)
      .options('/')
      .expect(204)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Credentials', 'true')
      .expect('Access-Control-Max-Age', '86400');
  });

  it('allows custom CORS configuration', async () => {
    const server = await givenAServer({
      rest: {
        port: 0,
        cors: {
          optionsSuccessStatus: 200,
          maxAge: 1,
        },
      },
    });

    server.handler(dummyRequestHandler);

    await createClientForHandler(server.requestHandler)
      .options('/')
      .expect(200)
      .expect('Access-Control-Max-Age', '1');
  });

  it('exposes "GET /openapi.json" endpoint', async () => {
    const server = await givenAServer();
    const greetSpec = {
      responses: {
        200: {
          content: {'text/plain': {schema: {type: 'string'}}},
          description: 'greeting of the day',
        },
      },
    };
    server.route('get', '/greet', greetSpec, function greet() {});

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.json',
    );
    expect(response.body).to.containDeep({
      openapi: '3.0.0',
      info: {
        title: 'LoopBack Application',
        version: '1.0.0',
      },
      servers: [{url: '/'}],
      paths: {
        '/greet': {
          get: {
            responses: {
              '200': {
                content: {
                  'text/plain': {
                    schema: {type: 'string'},
                  },
                },
                description: 'greeting of the day',
              },
            },
          },
        },
      },
    });
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('exposes "GET /openapi.json" with openApiSpec.servers', async () => {
    const server = await givenAServer({
      rest: {
        port: 0,
        openApiSpec: {
          servers: [{url: 'http://127.0.0.1:8080'}],
        },
      },
    });

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.json',
    );
    expect(response.body.servers).to.eql([{url: 'http://127.0.0.1:8080'}]);
  });

  it('exposes "GET /openapi.json" with openApiSpec.setServersFromRequest', async () => {
    const server = await givenAServer({
      rest: {
        port: 0,
        openApiSpec: {
          setServersFromRequest: true,
        },
      },
    });

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.json',
    );
    expect(response.body.servers[0].url).to.match(/http:\/\/127.0.0.1\:\d+/);
  });

  it('exposes endpoints with openApiSpec.endpointMapping', async () => {
    const server = await givenAServer({
      rest: {
        port: 0,
        openApiSpec: {
          endpointMapping: {
            '/openapi': {version: '3.0.0', format: 'yaml'},
          },
        },
      },
    });

    const test = createClientForHandler(server.requestHandler);
    await test.get('/openapi').expect(200, /openapi\: 3\.0\.0/);
    await test.get('/openapi.json').expect(404);
  });

  it('exposes "GET /openapi.yaml" endpoint', async () => {
    const server = await givenAServer();
    const greetSpec = {
      responses: {
        200: {
          content: {'text/plain': {schema: {type: 'string'}}},
          description: 'greeting of the day',
        },
      },
    };
    server.route('get', '/greet', greetSpec, function greet() {});

    const response = await createClientForHandler(server.requestHandler).get(
      '/openapi.yaml',
    );
    const expected = yaml.safeLoad(`
openapi: 3.0.0
info:
  title: LoopBack Application
  version: 1.0.0
paths:
  /greet:
    get:
      responses:
        '200':
          description: greeting of the day
          content:
            'text/plain':
              schema:
                type: string
    `);
    // Use json for comparison to tolerate textual diffs
    const json = yaml.safeLoad(response.text);
    expect(json).to.containDeep(expected);
    expect(json.servers[0].url).to.match('/');

    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('disables endpoints with openApiSpec.disabled = true', async () => {
    const server = await givenAServer({
      rest: {
        port: 0,
        openApiSpec: {
          disabled: true,
        },
      },
    });

    const test = createClientForHandler(server.requestHandler);
    await test.get('/openapi.json').expect(404);
    await test.get('/openapi.yaml').expect(404);
    await test.get('/explorer').expect(404);
  });

  it('can add openApiSpec endpoints before express initialization', async () => {
    const server = await givenAServer();
    server.addOpenApiSpecEndpoint('/custom-openapi.json', {
      version: '3.0.0',
      format: 'json',
    });

    const test = createClientForHandler(server.requestHandler);
    await test.get('/custom-openapi.json').expect(200);
  });

  // this doesn't work: once the generic routes have been added to express to
  // direct requests at controllers, adding OpenAPI spec routes after that
  // no longer works in the sense that express won't ever try those routes
  // https://github.com/strongloop/loopback-next/issues/433 will make changes
  // that make it possible to enable this test
  it.skip('can add openApiSpec endpoints after express initialization', async () => {
    const server = await givenAServer();
    const test = createClientForHandler(server.requestHandler);
    server.addOpenApiSpecEndpoint('/custom-openapi.json', {
      version: '3.0.0',
      format: 'json',
    });

    await test.get('/custom-openapi.json').expect(200);
  });

  it('rejects duplicate additions of openApiSpec endpoints', async () => {
    const server = await givenAServer();
    server.addOpenApiSpecEndpoint('/custom-openapi.json', {
      version: '3.0.0',
      format: 'json',
    });
    expect(() =>
      server.addOpenApiSpecEndpoint('/custom-openapi.json', {
        version: '3.0.0',
        format: 'yaml',
      }),
    ).to.throw(/already configured/);
  });

  it('exposes "GET /explorer" endpoint', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);
    const greetSpec = {
      responses: {
        200: {
          schema: {type: 'string'},
          description: 'greeting of the day',
        },
      },
    };
    server.route('get', '/greet', greetSpec, function greet() {});

    const response = await createClientForHandler(server.requestHandler).get(
      '/explorer',
    );
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'http://explorer.loopback.io',
        '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
      ].join(''),
    );
    expect(response.status).to.equal(302);
    expect(response.get('Location')).match(expectedUrl);
    expect(response.get('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.get('Access-Control-Allow-Credentials')).to.equal('true');
  });

  it('can be configured to disable "GET /explorer"', async () => {
    const server = await givenAServer({
      rest: {
        ...givenHttpServerConfig(),
        apiExplorer: {disabled: true},
      },
    });

    const request = createClientForHandler(server.requestHandler);
    await request.get('/explorer').expect(404);
  });

  it('honors "x-forwarded-*" headers', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);

    const response = await createClientForHandler(server.requestHandler)
      .get('/explorer')
      .set('x-forwarded-proto', 'https')
      .set('x-forwarded-host', 'example.com')
      .set('x-forwarded-port', '8080');
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'https://explorer.loopback.io',
        '\\?url=https://example.com:8080/openapi.json',
      ].join(''),
    );
    expect(response.get('Location')).match(expectedUrl);
  });

  it('honors "x-forwarded-host" headers', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);

    const response = await createClientForHandler(server.requestHandler)
      .get('/explorer')
      .set('x-forwarded-proto', 'http')
      .set('x-forwarded-host', 'example.com:8080,my.example.com:9080');
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'http://explorer.loopback.io',
        '\\?url=http://example.com:8080/openapi.json',
      ].join(''),
    );
    expect(response.get('Location')).match(expectedUrl);
  });

  it('skips port if it is the default for http or https', async () => {
    const app = new Application();
    app.component(RestComponent);
    const server = await app.getServer(RestServer);

    const response = await createClientForHandler(server.requestHandler)
      .get('/explorer')
      .set('x-forwarded-proto', 'https')
      .set('x-forwarded-host', 'example.com')
      .set('x-forwarded-port', '443');
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'https://explorer.loopback.io',
        '\\?url=https://example.com/openapi.json',
      ].join(''),
    );
    expect(response.get('Location')).match(expectedUrl);
  });

  it('handles requests with missing Host header', async () => {
    const app = new RestApplication({
      rest: {port: 0, host: '127.0.0.1'},
    });
    await app.start();
    const port = await app.restServer.get(RestBindings.PORT);

    const response = await createRestAppClient(app)
      .get('/explorer')
      .set('host', '');
    await app.stop();
    const expectedUrl = new RegExp(`\\?url=http://127.0.0.1:${port}`);
    expect(response.get('Location')).match(expectedUrl);
  });

  it('exposes "GET /explorer" endpoint with apiExplorer.url', async () => {
    const server = await givenAServer({
      rest: {
        apiExplorer: {
          url: 'https://petstore.swagger.io',
        },
      },
    });

    const response = await createClientForHandler(server.requestHandler).get(
      '/explorer',
    );
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'https://petstore.swagger.io',
        '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
      ].join(''),
    );
    expect(response.status).to.equal(302);
    expect(response.get('Location')).match(expectedUrl);
  });

  it('exposes "GET /explorer" endpoint with apiExplorer.urlForHttp', async () => {
    const server = await givenAServer({
      rest: {
        apiExplorer: {
          url: 'https://petstore.swagger.io',
          httpUrl: 'http://petstore.swagger.io',
        },
      },
    });

    const response = await createClientForHandler(server.requestHandler).get(
      '/explorer',
    );
    await server.get(RestBindings.PORT);
    const expectedUrl = new RegExp(
      [
        'http://petstore.swagger.io',
        '\\?url=http://\\d+.\\d+.\\d+.\\d+:\\d+/openapi.json',
      ].join(''),
    );
    expect(response.status).to.equal(302);
    expect(response.get('Location')).match(expectedUrl);
  });

  it('supports HTTPS protocol with key and certificate files', async () => {
    const keyPath = path.join(FIXTURES, 'key.pem');
    const certPath = path.join(FIXTURES, 'cert.pem');
    const serverOptions = givenHttpServerConfig({
      port: 0,
      protocol: 'https',
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    });
    const server = await givenAServer({rest: serverOptions});
    server.handler(dummyRequestHandler);
    await server.start();
    const serverUrl = server.getSync(RestBindings.URL);
    const res = await httpsGetAsync(serverUrl);
    expect(res.statusCode).to.equal(200);
  });

  it('supports HTTPS protocol with a pfx file', async () => {
    const pfxPath = path.join(FIXTURES, 'pfx.pfx');
    const serverOptions = givenHttpServerConfig({
      port: 0,
      protocol: 'https' as 'https',
      pfx: fs.readFileSync(pfxPath),
      passphrase: 'loopback4',
    });
    const server = await givenAServer({rest: serverOptions});
    server.handler(dummyRequestHandler);
    await server.start();
    const serverUrl = server.getSync(RestBindings.URL);
    const res = await httpsGetAsync(serverUrl);
    expect(res.statusCode).to.equal(200);
    await server.stop();
  });

  skipOnTravis(it, 'handles IPv6 loopback address in HTTPS', async () => {
    const keyPath = path.join(FIXTURES, 'key.pem');
    const certPath = path.join(FIXTURES, 'cert.pem');
    const server = await givenAServer({
      rest: {
        port: 0,
        host: '::1',
        protocol: 'https',
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
    });
    server.handler(dummyRequestHandler);
    await server.start();
    const serverUrl = server.getSync(RestBindings.URL);
    const res = await httpsGetAsync(serverUrl);
    expect(res.statusCode).to.equal(200);
    await server.stop();
  });

  // https://github.com/strongloop/loopback-next/issues/1623
  skipOnTravis(it, 'handles IPv6 address for API Explorer UI', async () => {
    const keyPath = path.join(FIXTURES, 'key.pem');
    const certPath = path.join(FIXTURES, 'cert.pem');
    const server = await givenAServer({
      rest: {
        port: 0,
        host: '::1',
        protocol: 'https',
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      },
    });
    server.handler(dummyRequestHandler);
    await server.start();
    const serverUrl = server.getSync(RestBindings.URL);

    // The `Location` header should be something like
    // https://explorer.loopback.io?url=https://[::1]:58470/openapi.json
    const res = await httpsGetAsync(serverUrl + '/explorer');
    const location = res.headers['location'];
    expect(location).to.match(/\[\:\:1\]\:\d+\/openapi.json/);
    expect(location).to.equal(
      `https://explorer.loopback.io?url=${serverUrl}/openapi.json`,
    );
    await server.stop();
  });

  it('honors HTTPS config binding after instantiation', async () => {
    const keyPath = path.join(FIXTURES, 'key.pem');
    const certPath = path.join(FIXTURES, 'cert.pem');
    const serverOptions = givenHttpServerConfig({
      port: 0,
      protocol: 'https',
      key: undefined,
      cert: undefined,
    });
    const server = await givenAServer({rest: serverOptions});

    server.handler(dummyRequestHandler);
    await server.start();
    let serverUrl = server.getSync(RestBindings.URL);
    await expect(httpsGetAsync(serverUrl)).to.be.rejectedWith(/EPROTO/);
    await server.stop();
    server.bind(RestBindings.HTTPS_OPTIONS).to({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    });
    await server.start();
    serverUrl = server.getSync(RestBindings.URL);
    const res = await httpsGetAsync(serverUrl);
    expect(res.statusCode).to.equal(200);
    await server.stop();
  });

  it('creates a redirect route with the default status code', async () => {
    const server = await givenAServer();
    server.controller(DummyController);
    server.redirect('/page/html', '/html');
    const response = await createClientForHandler(server.requestHandler)
      .get('/page/html')
      .expect(303);
    await createClientForHandler(server.requestHandler)
      .get(response.header.location)
      .expect(200, 'Hi');
  });

  it('creates a redirect route with a custom status code', async () => {
    const server = await givenAServer();
    server.controller(DummyController);
    server.redirect('/page/html', '/html', 307);
    const response = await createClientForHandler(server.requestHandler)
      .get('/page/html')
      .expect(307);
    await createClientForHandler(server.requestHandler)
      .get(response.header.location)
      .expect(200, 'Hi');
  });

  describe('basePath', () => {
    const root = ASSETS;
    let server: RestServer;

    beforeEach(async () => {
      server = await givenAServer({
        rest: {
          basePath: '/api',
          port: 0,
        },
      });
    });

    it('controls static assets', async () => {
      server.static('/html', root);

      const content = fs
        .readFileSync(path.join(root, 'index.html'))
        .toString('utf-8');
      await createClientForHandler(server.requestHandler)
        .get('/api/html/index.html')
        .expect('Content-Type', /text\/html/)
        .expect(200, content);
    });

    it('controls controller routes', async () => {
      server.controller(DummyController);

      await createClientForHandler(server.requestHandler)
        .get('/api/html')
        .expect(200, 'Hi');
    });

    it('reports 404 if not found', async () => {
      server.static('/html', root);
      server.controller(DummyController);

      await createClientForHandler(server.requestHandler)
        .get('/html')
        .expect(404);
    });

    it('controls server urls', async () => {
      const response = await createClientForHandler(server.requestHandler).get(
        '/openapi.json',
      );
      expect(response.body.servers).to.containEql({url: '/api'});
    });

    it('controls server urls even when set via server.basePath() API', async () => {
      server.basePath('/v2');
      const response = await createClientForHandler(server.requestHandler).get(
        '/openapi.json',
      );
      expect(response.body.servers).to.containEql({url: '/v2'});
    });

    it('controls redirect locations', async () => {
      server.controller(DummyController);
      server.redirect('/page/html', '/html');
      const response = await createClientForHandler(server.requestHandler)
        .get('/api/page/html')
        .expect(303);
      await createClientForHandler(server.requestHandler)
        .get(response.header.location)
        .expect(200, 'Hi');
    });
  });

  async function givenAServer(
    options: {rest: RestServerConfig} = {rest: {port: 0}},
  ) {
    options.rest = givenHttpServerConfig(options.rest);
    const app = new Application(options);
    app.component(RestComponent);
    return app.getServer(RestServer);
  }

  function dummyRequestHandler(handler: {
    request: IncomingMessage;
    response: ServerResponse;
  }) {
    const {response} = handler;
    response.write('Hello');
    response.end();
  }

  class DummyController {
    constructor() {}
    @get('/html', {
      responses: {},
    })
    ping(): string {
      return 'Hi';
    }
    @get('/endpoint', {
      responses: {},
    })
    hello(): string {
      return 'hello';
    }
  }

  class DummyXmlController {
    constructor() {}
    @post('/')
    echo(
      @requestBody({
        content: {
          'application/xml': {
            schema: {
              type: 'object',
            },
          },
        },
      })
      body: object,
    ): object {
      return body;
    }
  }

  function readFileFromDirectory(
    dirname: string,
    filename: string,
  ): Promise<string> {
    return readFileAsync(path.join(dirname, filename), {encoding: 'utf-8'});
  }
});
