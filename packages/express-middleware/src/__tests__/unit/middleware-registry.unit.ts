// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {
  expect,
  ShotRequestOptions,
  stubExpressContext,
} from '@loopback/testlab';
import {Request, RequestHandler, Response, Router} from 'express';
import {asMiddlewareBinding, MiddlewareRegistry, MiddlewareSpec} from '../..';

describe('MiddlewareRegistry', () => {
  const DUMMY_RESPONSE = ({
    setHeader: () => {},
    end: () => {},
  } as unknown) as Response;
  let ctx: Context;
  let registry: MiddlewareRegistry;
  let events: string[];

  beforeEach(givenContext);
  beforeEach(givenMiddlewareRegistry);

  it('builds an express router', async () => {
    registry.setPhasesByOrder(['cors', 'auth', 'route', 'final']);

    givenMiddleware('rest', {phase: 'route', path: '/api'});
    givenMiddlewareProvider('cors', {phase: 'cors'});
    givenMiddleware('token', {phase: 'auth'});
    await testRouter('get', '/api/orders');
    expect(events).to.eql(['token: GET /api/orders', 'rest: GET /orders']);
  });

  function givenContext() {
    events = [];
    ctx = new Context('app');
  }

  async function givenMiddlewareRegistry() {
    ctx.bind('middleware.registry').toClass(MiddlewareRegistry);
    registry = await ctx.get('middleware.registry');
  }

  function givenMiddleware(name: string, spec?: MiddlewareSpec) {
    const middleware: RequestHandler = (req, res, next) => {
      events.push(`${name}: ${req.method} ${req.url}`);
      next();
    };
    ctx
      .bind(`middleware.${name}`)
      .to(middleware)
      .apply(asMiddlewareBinding(spec));
  }

  function givenMiddlewareProvider(moduleName: string, spec?: MiddlewareSpec) {
    class MiddlewareProvider implements Provider<MiddlewareProvider> {
      private middlewareModule: Function;
      constructor(
        @inject(`middleware.${moduleName}.options`, {optional: true})
        private options: object = {},
      ) {
        this.middlewareModule = require(moduleName);
      }

      value() {
        return this.middlewareModule(this.options);
      }
    }
    ctx
      .bind(`middleware.${moduleName}`)
      .toProvider(MiddlewareProvider)
      .apply(asMiddlewareBinding(spec));
  }

  function givenRequest(options?: ShotRequestOptions): Request {
    return stubExpressContext(options).request;
  }

  async function testRouter(method: string, url: string) {
    const router = await registry.mountMiddleware(Router());
    await new Promise<void>((resolve, reject) => {
      router(givenRequest({url, method}), DUMMY_RESPONSE, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
});
