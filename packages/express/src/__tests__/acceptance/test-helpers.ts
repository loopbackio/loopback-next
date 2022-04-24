// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  createProxyWithInterceptors,
  intercept,
  InterceptorOrKey,
} from '@loopback/core';
import {Client, givenHttpServerConfig, supertest} from '@loopback/testlab';
import bodyParser from 'body-parser';
import {NextFunction, Request, Response} from 'express';
import {ExpressApplication} from '../../express.application';
import {ExpressRequestHandler} from '../../types';
import {SpyAction, SpyConfig} from '../fixtures/spy-config';

export {default as spy} from '../fixtures/spy.middleware';
export {SpyConfig} from '../fixtures/spy-config';

function runAsyncWrapper(
  callback: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): ExpressRequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    callback(req, res, next).catch(next);
  };
}

export type TestFunction = (
  spyBinding: Binding<unknown>,
  path?: string,
) => Promise<unknown>;

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

    const handler: ExpressRequestHandler = runAsyncWrapper(
      async (req, res, next) => {
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
      },
    );
    this.app.expressServer.expressApp.post('/hello', handler);
    this.app.expressServer.expressApp.post('/greet', handler);
  }

  private configureSpy(
    spyBinding: Binding<unknown>,
    action: SpyAction = 'log',
  ) {
    this.app.configure<SpyConfig>(spyBinding.key).to({action});
  }

  async testSpyLog(spyBinding: Binding<unknown>, path = '/hello') {
    this.configureSpy(spyBinding);

    await this.assertSpyLog(path);
  }

  async assertSpyLog(path = '/hello') {
    await this.client
      .post(path)
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, World')
      .expect('x-spy-log', `POST ${path}`);
  }

  async testSpyMock(spyBinding: Binding<unknown>, path = '/hello') {
    this.configureSpy(spyBinding, 'mock');
    await this.assertSpyMock(path);
  }

  async assertSpyMock(path = '/hello') {
    await this.client
      .post(path)
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(200, 'Hello, Spy')
      .expect('x-spy-mock', `POST ${path}`);
  }

  async testSpyReject(spyBinding: Binding<unknown>, path = '/hello') {
    this.configureSpy(spyBinding, 'reject');
    await this.assertSpyReject(path);
  }

  private async assertSpyReject(path = '/hello') {
    await this.client
      .post(path)
      .send('"World"')
      .set('content-type', 'application/json')
      .expect(400)
      .expect('x-spy-reject', `POST ${path}`);
  }
}
