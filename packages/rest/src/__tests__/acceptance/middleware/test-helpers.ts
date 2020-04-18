// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, intercept, InterceptorOrKey} from '@loopback/context';
import {post, requestBody} from '@loopback/openapi-v3';
import {
  Client,
  createRestAppClient,
  givenHttpServerConfig,
} from '@loopback/testlab';
import {RestApplication} from '../../..';
import {SpyConfig} from '../../fixtures/middleware/spy-config';
import spyFactory from '../../fixtures/middleware/spy.middleware';
export const spy = spyFactory;
export {SpyConfig} from '../../fixtures/middleware/spy-config';

export type TestFunction = (spyBinding: Binding<unknown>) => Promise<unknown>;

export class TestHelper {
  readonly app: RestApplication;
  client: Client;

  constructor() {
    this.app = new RestApplication({rest: givenHttpServerConfig()});
  }

  async start() {
    await this.app.start();
    this.client = createRestAppClient(this.app);
  }

  stop() {
    return this.app.stop();
  }

  bindController(interceptor?: InterceptorOrKey) {
    const interceptors: InterceptorOrKey[] = [];
    if (interceptor) interceptors.push(interceptor);
    class MyController {
      @intercept(...interceptors)
      @post('/hello', {
        responses: {
          '200': {
            content: {'application/json': {schema: {type: 'string'}}},
          },
        },
      })
      hello(
        @requestBody({
          content: {
            'application/json': {
              schema: {type: 'string'},
            },
          },
        })
        msg: string,
      ) {
        return `Hello, ${msg}`;
      }
    }
    return this.app.controller<unknown>(MyController);
  }

  async testSpyLog(spyBinding: Binding<unknown>) {
    // We have to re-configure at restServer level
    // as `this.app.middleware()` delegates to `restServer`
    this.app.restServer
      .configure<SpyConfig>(spyBinding.key)
      .to({action: 'log'});

    await this.assertSpyLog();
  }

  async assertSpyLog() {
    await this.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, World')
      .expect('x-spy-log', 'POST /hello');
  }

  async testSpyMock(spyBinding: Binding<unknown>) {
    // We have to re-configure at restServer level
    // as `this.app.middleware()` delegates to `restServer`
    this.app.restServer
      .configure<SpyConfig>(spyBinding.key)
      .to({action: 'mock'});
    await this.assertSpyMock();
  }

  async assertSpyMock() {
    await this.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, Spy')
      .expect('x-spy-mock', 'POST /hello');
  }

  async testSpyReject(spyBinding: Binding<unknown>) {
    // We have to re-configure at restServer level
    // as `this.app.middleware()` delegates to `restServer`
    this.app.restServer
      .configure<SpyConfig>(spyBinding.key)
      .to({action: 'reject'});
    await this.assertSpyReject();
  }

  async assertSpyReject() {
    await this.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(400)
      .expect('x-spy-reject', 'POST /hello');
  }
}
