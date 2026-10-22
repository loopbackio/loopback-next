// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/http-caching-proxy
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, sinon} from '@loopback/testlab';
import {IncomingMessage} from 'node:http';
import {Socket} from 'node:net';
import {HttpCachingProxy} from '../../http-caching-proxy';

describe('HttpCachingProxy (unit)', () => {
  describe('constructor', () => {
    it('rejects missing cachePath option', () => {
      expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        () => new HttpCachingProxy({cachePath: undefined} as any),
      ).to.throwError(/required option.*cachePath/i);
    });

    it('applies DEFAULT_OPTIONS when none are provided', () => {
      const proxy = new HttpCachingProxy({cachePath: '/tmp/test-cache'});
      expect(proxy.url).to.equal('http://proxy-not-running');
    });
  });

  describe('stop()', () => {
    it('is a no-op when the proxy is not running', async () => {
      const proxy = new HttpCachingProxy({cachePath: '/tmp/test-cache'});
      // Should resolve without throwing
      await proxy.stop();
      expect(proxy.url).to.equal('http://proxy-not-running');
    });
  });

  describe('logError()', () => {
    let proxy: HttpCachingProxy;
    let consoleErrorStub: sinon.SinonStub;
    let fakeRequest: IncomingMessage;

    beforeEach(() => {
      fakeRequest = new IncomingMessage(new Socket());
      fakeRequest.method = 'GET';
      fakeRequest.url = 'http://example.com';
    });

    afterEach(() => {
      consoleErrorStub?.restore();
    });

    it('calls console.error when logError option is true (default)', () => {
      proxy = new HttpCachingProxy({cachePath: '/tmp/test-cache'});
      consoleErrorStub = sinon.stub(console, 'error');

      const error = new Error('test error');
      proxy.logError(fakeRequest, error);

      sinon.assert.calledOnce(consoleErrorStub);
      sinon.assert.calledWith(
        consoleErrorStub,
        'Cannot proxy %s %s.',
        'GET',
        'http://example.com',
        error.stack ?? error,
      );
    });

    it('does NOT call console.error when logError option is false', () => {
      proxy = new HttpCachingProxy({
        cachePath: '/tmp/test-cache',
        logError: false,
      });
      consoleErrorStub = sinon.stub(console, 'error');

      const error = new Error('test error');
      proxy.logError(fakeRequest, error);

      sinon.assert.notCalled(consoleErrorStub);
    });

    it('uses the error object itself when error.stack is undefined', () => {
      proxy = new HttpCachingProxy({cachePath: '/tmp/test-cache'});
      consoleErrorStub = sinon.stub(console, 'error');

      const error = new Error('no-stack error');
      delete error.stack;

      proxy.logError(fakeRequest, error);

      sinon.assert.calledOnce(consoleErrorStub);
      const lastArg =
        consoleErrorStub.firstCall.args[
          consoleErrorStub.firstCall.args.length - 1
        ];
      expect(lastArg).to.equal(error);
    });

    it('uses error.stack when it is defined', () => {
      proxy = new HttpCachingProxy({cachePath: '/tmp/test-cache'});
      consoleErrorStub = sinon.stub(console, 'error');

      const error = new Error('stack error');
      error.stack = 'Error: stack error\n    at Test.stack';

      proxy.logError(fakeRequest, error);

      sinon.assert.calledOnce(consoleErrorStub);
      const lastArg =
        consoleErrorStub.firstCall.args[
          consoleErrorStub.firstCall.args.length - 1
        ];
      expect(lastArg).to.equal(error.stack);
    });
  });
});
