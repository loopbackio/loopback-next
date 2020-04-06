// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import axios, {
  AxiosProxyConfig,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import delay from 'delay';
import http from 'http';
import {AddressInfo} from 'net';
import pEvent from 'p-event';
import path from 'path';
import rimrafCb from 'rimraf';
import tunnel, {ProxyOptions as TunnelProxyOptions} from 'tunnel';
import {URL} from 'url';
import util from 'util';
import {HttpCachingProxy, ProxyOptions} from '../../http-caching-proxy';

const CACHE_DIR = path.join(__dirname, '.cache');

const rimraf = util.promisify(rimrafCb);

describe('HttpCachingProxy', () => {
  let stubServerUrl: string;
  before(givenStubServer);
  after(stopStubServer);

  let proxy: HttpCachingProxy;
  after(stopProxy);

  beforeEach('clean cache dir', async () => rimraf(CACHE_DIR));

  it('provides "url" property when running', async () => {
    await givenRunningProxy();
    expect(proxy.url).to.match(/^http:\/\/127.0.0.1:\d+$/);
  });

  it('provides invalid "url" property when not running', async () => {
    proxy = new HttpCachingProxy({cachePath: CACHE_DIR});
    expect(proxy.url).to.match(/not-running/);
  });

  it('proxies HTTP requests', async function () {
    // Increase the timeout to accommodate slow network connections
    // eslint-disable-next-line no-invalid-this
    this.timeout(30000);

    await givenRunningProxy();
    const result = await makeRequest({
      url: 'http://example.com',
    });

    expect(result.statusCode).to.equal(200);
    expect(result.body).to.containEql('example');
  });

  it('reports error for HTTP requests', async function () {
    // Increase the timeout to accommodate slow network connections
    // eslint-disable-next-line no-invalid-this
    this.timeout(30000);

    await givenRunningProxy({logError: false});
    await expect(
      makeRequest({
        url: 'http://does-not-exist.example.com',
      }),
    ).to.be.rejectedWith(
      // The error can be
      // '502 - "Error: getaddrinfo EAI_AGAIN does-not-exist.example.com:80"'
      // '502 - "Error: getaddrinfo ENOTFOUND does-not-exist.example.com'
      /502 - "Error: getaddrinfo/,
    );
  });

  it('reports timeout error for HTTP requests', async function () {
    await givenRunningProxy({logError: false, timeout: 1});
    await expect(
      makeRequest({
        url:
          'http://www.mocky.io/v2/5dade5e72d0000a542e4bd9c?mocky-delay=1000ms',
      }),
    ).to.be.rejectedWith(/502 - "Error: timeout of 1ms exceeded/);
  });

  it('proxies HTTPs requests (no tunneling)', async function () {
    // Increase the timeout to accommodate slow network connections
    // eslint-disable-next-line no-invalid-this
    this.timeout(30000);

    await givenRunningProxy();
    const result = await makeRequest({
      url: 'https://example.com',
    });

    expect(result.statusCode).to.equal(200);
    expect(result.body).to.containEql('example');
  });

  it('rejects CONNECT requests (HTTPS tunneling)', async () => {
    await givenRunningProxy();
    const agent = tunnel.httpsOverHttp({
      proxy: getTunnelProxyConfig(proxy.url),
    });
    const resultPromise = makeRequest({
      url: 'https://example.com',
      httpsAgent: agent,
      proxy: false,
    });

    await expect(resultPromise).to.be.rejectedWith(
      /tunneling socket could not be established, statusCode=501/,
    );
  });

  it('forwards request/response headers', async () => {
    await givenRunningProxy();
    givenServerDumpsRequests();

    const result = await makeRequest({
      url: stubServerUrl,
      responseType: 'json',
      headers: {'x-client': 'test'},
    });

    expect(result.headers).to.containEql({
      'x-server': 'dumping-server',
    });
    expect(result.body.headers).to.containDeep({
      'x-client': 'test',
    });
  });

  it('forwards request body', async () => {
    await givenRunningProxy();
    stubServerHandler = (req, res) => req.pipe(res);

    const result = await makeRequest({
      method: 'POST',
      url: stubServerUrl,
      data: 'a text body',
    });

    expect(result.body).to.equal('a text body');
  });

  it('caches responses', async () => {
    await givenRunningProxy();
    let counter = 1;
    stubServerHandler = function (req, res) {
      res.writeHead(201, {'x-counter': counter++});
      res.end(JSON.stringify({counter: counter++}));
    };

    const opts: AxiosRequestConfig = {
      url: stubServerUrl,
      responseType: 'json',
    };

    const result1 = await makeRequest(opts);
    const result2 = await makeRequest(opts);

    expect(result1.statusCode).equal(201);

    expect(result1.statusCode).equal(result2.statusCode);
    expect(result1.body).deepEqual(result2.body);
    expect(result1.headers).deepEqual(result2.headers);
  });

  it('refreshes expired cache entries', async () => {
    await givenRunningProxy({ttl: 1});

    let counter = 1;
    stubServerHandler = (req, res) => res.end(String(counter++));

    const opts = {
      url: stubServerUrl,
    };

    const result1 = await makeRequest(opts);
    await delay(10);
    const result2 = await makeRequest(opts);

    expect(result1.body).to.equal(1);
    expect(result2.body).to.equal(2);
  });

  it('handles the case where backend service is not running', async function () {
    // This test takes a bit longer to finish on windows.
    // eslint-disable-next-line no-invalid-this
    this.timeout(3000);
    await givenRunningProxy({logError: false});

    await expect(makeRequest({url: 'http://127.0.0.1:1/'})).to.be.rejectedWith({
      status: 502,
    });
  });

  async function givenRunningProxy(options?: Partial<ProxyOptions>) {
    proxy = new HttpCachingProxy(
      Object.assign({cachePath: CACHE_DIR}, options),
    );
    await proxy.start();
  }

  async function stopProxy() {
    if (!proxy) return;
    await proxy.stop();
  }

  /**
   * Parse a url to `tunnel` proxy options
   * @param url - proxy url string
   */
  function getTunnelProxyConfig(url: string): TunnelProxyOptions {
    const parsed = new URL(url);
    const options: TunnelProxyOptions = {
      host: parsed.hostname,
      port: parseInt(parsed.port),
    };
    if (parsed.username) {
      options.proxyAuth = `${parsed.username}:${parsed.password}`;
    }
    return options;
  }

  /**
   * Parse a url to Axios proxy configuration object
   * @param url - proxy url string
   */
  function getProxyConfig(url: string): AxiosProxyConfig {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port),
      protocol: parsed.protocol,
      auth: {
        username: parsed.username,
        password: parsed.password,
      },
    };
  }

  const axiosInstance = axios.create({
    // Provide a custom function to control when Axios throws errors based on
    // http status code. Please note that Axios creates a new error in such
    // condition and the original low-level error is lost
    validateStatus: () => true,
  });

  /**
   * Helper method to make an http request via the proxy
   * @param config - Axios request
   */
  async function makeRequest(config: AxiosRequestConfig) {
    config = {
      proxy: getProxyConfig(proxy.url),
      ...config,
    };
    const res = await axiosInstance(config);
    // Throw an error with message from the original error
    if (res.status >= 300) {
      const errData = JSON.stringify(res.data);
      const err = new Error(`${res.status} - ${errData}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (err as any).status = res.status;
      throw err;
    }
    const patchedRes = Object.create(res) as AxiosResponse & {
      statusCode: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: any;
    };
    patchedRes.statusCode = res.status;
    patchedRes.body = res.data;
    return patchedRes;
  }

  let stubServer: http.Server | undefined,
    stubServerHandler:
      | ((request: http.IncomingMessage, response: http.ServerResponse) => void)
      | undefined;
  async function givenStubServer() {
    stubServerHandler = undefined;
    stubServer = http.createServer(function handleRequest(req, res) {
      if (stubServerHandler) {
        try {
          stubServerHandler(req, res);
        } catch (err) {
          res.end(500);
          process.nextTick(() => {
            throw err;
          });
        }
      } else {
        res.writeHead(501);
        res.end();
      }
    });
    stubServer.listen(0);
    await pEvent(stubServer, 'listening');
    const address = stubServer.address() as AddressInfo;
    stubServerUrl = `http://127.0.0.1:${address.port}`;
  }

  async function stopStubServer() {
    if (!stubServer) return;
    stubServer.close();
    await pEvent(stubServer, 'close');
    stubServer = undefined;
  }

  function givenServerDumpsRequests() {
    stubServerHandler = function dumpRequest(req, res) {
      res.writeHead(200, {
        'x-server': 'dumping-server',
      });
      res.write(
        JSON.stringify({
          method: req.method,
          url: req.url,
          headers: req.headers,
        }),
      );
      res.end();
    };
  }
});
