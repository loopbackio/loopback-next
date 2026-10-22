// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon} from '@loopback/testlab';
import axios, {AxiosProxyConfig, AxiosRequestConfig} from 'axios';
import {once} from 'node:events';
import fs from 'node:fs';
import http from 'node:http';
import {AddressInfo} from 'node:net';
import path from 'node:path';
import {rimraf} from 'rimraf';
import {HttpCachingProxy} from '../../http-caching-proxy';

const CACHE_DIR = path.join(__dirname, '.cache-extra');

describe('HttpCachingProxy (additional integration)', () => {
  let stubServerUrl: string;
  let stubServer: http.Server | undefined;

  before(async () => {
    stubServer = http.createServer((_req, res) => {
      res.writeHead(200);
      res.end('ok');
    });
    stubServer.listen(0);
    await once(stubServer, 'listening');
    const address = stubServer.address() as AddressInfo;
    stubServerUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    if (!stubServer) return;
    stubServer.close();
    await once(stubServer, 'close');
    stubServer = undefined;
  });

  beforeEach('clean cache dir', async () => rimraf(CACHE_DIR));

  let proxy: HttpCachingProxy;

  afterEach(async () => {
    if (proxy) {
      await proxy.stop();
    }
  });

  it('stop() is idempotent — second call is a no-op', async () => {
    proxy = new HttpCachingProxy({cachePath: CACHE_DIR});
    await proxy.start();
    await proxy.stop();
    // Second stop should not throw
    await proxy.stop();
  });

  it('serves the request and falls back to backend when cache has a non-ENOENT error', async () => {
    // Populate the cache with a valid entry first
    proxy = new HttpCachingProxy({cachePath: CACHE_DIR});
    await proxy.start();

    await makeRequest({url: stubServerUrl});

    // Corrupt the content files to cause EINTEGRITY on the next read
    const contentDir = path.join(CACHE_DIR, 'content-v2');
    corruptFiles(contentDir);

    // The proxy should handle the EINTEGRITY error gracefully (log a warning
    // and fall back to fetching from the backend) rather than crashing.
    // Stub console.warn so the test framework's console-log guard is satisfied.
    await proxy.stop();
    proxy = new HttpCachingProxy({cachePath: CACHE_DIR, logError: false});
    await proxy.start();

    const warnStub = sinon.stub(console, 'warn');
    let result;
    try {
      result = await makeRequest({url: stubServerUrl});
    } finally {
      warnStub.restore();
    }

    expect(result!.status).to.equal(200);
  });

  // ── helpers ────────────────────────────────────────────────────────────────

  const axiosInstance = axios.create({validateStatus: () => true});

  function getProxyConfig(url: string): AxiosProxyConfig {
    const parsed = new URL(url);
    return {
      protocol: parsed.protocol,
      host: parsed.hostname,
      port: parseInt(parsed.port),
    };
  }

  async function makeRequest(config: AxiosRequestConfig) {
    return axiosInstance({
      proxy: getProxyConfig(proxy.url),
      ...config,
    });
  }

  /**
   * Overwrite all files under `dir` with garbage so that cacache returns
   * an EINTEGRITY error instead of ENOENT.
   */
  function corruptFiles(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        corruptFiles(full);
      } else {
        fs.writeFileSync(full, 'corrupted');
      }
    }
  }
});
