// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  createProxyWithInterceptors,
  intercept,
  InterceptorOrKey,
} from '@loopback/context';
import {Client, givenHttpServerConfig, supertest} from '@loopback/testlab';
import bodyParser from 'body-parser';
import {ExpressApplication} from '../../express.application';
import {SpyAction, SpyConfig} from '../fixtures/spy-config';
import spyFactory from '../fixtures/spy.middleware';
export const spy = spyFactory;
export {SpyConfig} from '../fixtures/spy-config';

export type TestFunction = (spyBinding: Binding<unknown>) => Promise<unknown>;

export class TestHelper {
  readonly app: ExpressApplication;
  client: Client;

  constructor() {
    this.app = new ExpressApplication({
      express: {
        ...givenHttpServerConfig(),
        settings: {
          env: 'test',
        },
      },
    });
    this.app.expressServer.expressMiddleware(
      bodyParser.json,
      {strict: false},
      {key: 'middleware.bodyParser'},
    );
  }

  async start() {
    await this.app.start();
    this.client = supertest(this.app.expressServer.url);
  }

  stop() {
    return this.app.stop();
  }

  bindController(interceptor?: InterceptorOrKey) {
    const interceptors: InterceptorOrKey[] = [];
    if (interceptor) interceptors.push(interceptor);
    class MyController {
      @intercept(...interceptors)
      hello(msg: string) {
        return `Hello, ${msg}`;
      }
    }
    const binding = this.app.controller(MyController);
    this.app.expressServer.expressApp.post('/hello', async (req, res, next) => {
      try {
        const controller = await this.app.get<MyController>(binding.key);
        const proxy = createProxyWithInterceptors(
          controller,
          this.app.expressServer.getMiddlewareContext(req),
          undefined,
          {
            type: 'route',
            value: controller,
          },
        );
        res.send(await proxy.hello(req.body));
      } catch (err) {
        next(err);
      }
    });
  }

  private configureSpy(
    spyBinding: Binding<unknown>,
    action: SpyAction = 'log',
  ) {
    this.app.expressServer.configure<SpyConfig>(spyBinding.key).to({action});
  }

  async testSpyLog(spyBinding: Binding<unknown>) {
    this.configureSpy(spyBinding);

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
    this.configureSpy(spyBinding, 'mock');
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
    this.configureSpy(spyBinding, 'reject');
    await this.assertSpyReject();
  }

  private async assertSpyReject() {
    await this.client
      .post('/hello')
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(400)
      .expect('x-spy-reject', 'POST /hello');
  }
}
