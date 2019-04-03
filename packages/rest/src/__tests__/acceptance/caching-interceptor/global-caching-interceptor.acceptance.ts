// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {asGlobalInterceptor} from '@loopback/context';
import {anOperationSpec} from '@loopback/openapi-spec-builder';
import {get, param} from '@loopback/openapi-v3';
import {
  Client,
  createRestAppClient,
  expect,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {RestApplication} from '../../..';
import {
  cachedResults,
  CachingInterceptorProvider,
  clearCache,
  status,
} from './caching-interceptor';

describe('global caching interceptor', () => {
  let client: Client;
  let app: RestApplication;

  before(givenAClient);
  after(async () => {
    await app.stop();
  });

  context('caching invocation for controller methods', () => {
    it('invokes the controller method if not cached', async () => {
      await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
      expect(status.returnFromCache).to.be.false();
    });

    it('returns from cache without invoking the controller method', async () => {
      for (let i = 0; i <= 5; i++) {
        await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
        expect(status.returnFromCache).to.be.true();
      }
    });

    it('invokes the controller method after cache is cleared', async () => {
      clearCache();
      await client.get('/toUpperCase/Hello').expect(200, 'HELLO');
      expect(status.returnFromCache).to.be.false();
    });
  });

  context('caching invocation for route handler functions', () => {
    it('invokes the handler function if not cached', async () => {
      await client.get('/toLowerCase/Hello').expect(200, 'hello');
      expect(status.returnFromCache).to.be.false();
    });

    it('returns from cache without invoking the handler function', async () => {
      for (let i = 0; i <= 5; i++) {
        await client.get('/toLowerCase/Hello').expect(200, 'hello');
        expect(status.returnFromCache).to.be.true();
      }
    });

    it('invokes the handler function after cache is cleared', async () => {
      cachedResults.clear();
      await client.get('/toLowerCase/Hello').expect(200, 'hello');
      expect(status.returnFromCache).to.be.false();
    });
  });

  /**
   * OpenAPI operation spec for `toLowerCase(text: string)`
   */
  const toLowerCaseOperationSpec = anOperationSpec()
    .withOperationName('toLowerCase')
    .withParameter({
      name: 'text',
      in: 'path',
      schema: {
        type: 'string',
      },
    })
    .withStringResponse()
    .build();

  /**
   * A plain function to convert `text` to lower case
   * @param text
   */
  function toLowerCase(text: string) {
    return text.toLowerCase();
  }

  async function givenAClient() {
    clearCache();
    app = new RestApplication({rest: givenHttpServerConfig()});
    app
      .bind('caching-interceptor')
      .toProvider(CachingInterceptorProvider)
      .apply(asGlobalInterceptor());
    app.controller(StringCaseController);
    app.route(
      'get',
      '/toLowerCase/{text}',
      toLowerCaseOperationSpec,
      toLowerCase,
    );
    await app.start();
    client = createRestAppClient(app);
  }

  /**
   * A controller using interceptors for caching
   */
  class StringCaseController {
    @get('/toUpperCase/{text}')
    toUpperCase(@param.path.string('text') text: string) {
      return text.toUpperCase();
    }
  }
});
