// Copyright IBM Corp. and LoopBack contributors 2025. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application, Context, createBindingFromClass} from '@loopback/core';
import {expect, givenHttpServerConfig, supertest} from '@loopback/testlab';
import debugFactory from 'debug';
import {NextFunction, Request, Response} from 'express';
import {
  ExpressServer,
  getMiddlewareContext,
  invokeExpressMiddleware,
  InvokeMiddleware,
  InvokeMiddlewareProvider,
  MiddlewareContext,
  MiddlewareMixin,
  MiddlewareView,
  sortListOfGroups,
  toMiddleware,
} from '../..';

describe('express: additional unit tests', () => {
  describe('ExpressServer', () => {
    it('normalizes a basePath with a leading slash', () => {
      const server = new ExpressServer({basePath: '/api'});
      expect(server.basePath).to.equal('/api');
    });

    it('normalizes a basePath with a trailing slash', () => {
      const server = new ExpressServer({basePath: 'api/'});
      expect(server.basePath).to.equal('/api');
    });

    it('normalizes a basePath without slashes', () => {
      const server = new ExpressServer({basePath: 'api'});
      expect(server.basePath).to.equal('/api');
    });

    it('uses an empty basePath by default', () => {
      const server = new ExpressServer();
      expect(server.basePath).to.equal('');
    });

    it('applies Express settings from the config', () => {
      const server = new ExpressServer({
        settings: {'x-powered-by': false, env: 'test'},
      });
      expect(server.expressApp.get('x-powered-by')).to.be.false();
      expect(server.expressApp.get('env')).to.equal('test');
    });

    it('is not listening before start()', () => {
      const server = new ExpressServer();
      expect(server.listening).to.be.false();
    });

    it('exposes url with basePath and rootUrl once started', async () => {
      const server = new ExpressServer({
        ...givenHttpServerConfig(),
        basePath: '/api',
      });
      await server.start();
      try {
        expect(server.listening).to.be.true();
        expect(server.rootUrl).to.match(/^http:\/\//);
        expect(server.url).to.equal(`${server.rootUrl}/api`);
      } finally {
        await server.stop();
      }
      expect(server.listening).to.be.false();
    });

    it('serves requests under basePath only', async () => {
      const server = new ExpressServer({
        ...givenHttpServerConfig(),
        basePath: '/api',
      });
      server.expressApp.get('/api/ping', (_req, res) => {
        res.send('pong');
      });
      await server.start();
      try {
        await supertest(server.rootUrl!).get('/api/ping').expect(200, 'pong');
        await supertest(server.rootUrl!).get('/ping').expect(404);
      } finally {
        await server.stop();
      }
    });

    it('can be created with a parent context', () => {
      const parent = new Application();
      const server = new ExpressServer(undefined, parent);
      expect(server.parent).to.equal(parent);
    });
  });

  describe('toMiddleware()', () => {
    function givenMiddlewareContext(): MiddlewareContext {
      const req = {method: 'GET', url: '/'} as Request;
      const res = {} as Response;
      return new MiddlewareContext(req, res, new Context());
    }

    it('wraps a single Express handler', async () => {
      const calls: string[] = [];
      const middleware = toMiddleware((_req, _res, next) => {
        calls.push('h1');
        next();
      });
      const ctx = givenMiddlewareContext();
      await middleware(ctx, async () => {
        calls.push('next');
        return undefined;
      });
      expect(calls).to.eql(['h1', 'next']);
    });

    it('chains multiple Express handlers in order', async () => {
      const calls: string[] = [];
      const handler =
        (name: string) =>
        (_req: Request, _res: Response, next: NextFunction) => {
          calls.push(name);
          next();
        };
      const middleware = toMiddleware(
        handler('h1'),
        handler('h2'),
        handler('h3'),
      );
      const ctx = givenMiddlewareContext();
      await middleware(ctx, async () => {
        calls.push('next');
        return undefined;
      });
      expect(calls).to.eql(['h1', 'h2', 'h3', 'next']);
    });
  });

  describe('invokeExpressMiddleware()', () => {
    it('throws if no handler is provided', () => {
      const ctx = new MiddlewareContext(
        {method: 'GET', url: '/'} as Request,
        {} as Response,
        new Context(),
      );
      expect(() => invokeExpressMiddleware(ctx)).to.throw(
        'No Express middleware handler function is provided.',
      );
    });
  });

  describe('getMiddlewareContext()', () => {
    it('returns undefined if the request is not provided', () => {
      expect(getMiddlewareContext(undefined)).to.be.undefined();
    });

    it('returns undefined if the request has no middleware context', () => {
      expect(getMiddlewareContext({} as Request)).to.be.undefined();
    });

    it('returns the middleware context bound to the request', () => {
      const req = {method: 'GET', url: '/'} as Request;
      const ctx = new MiddlewareContext(req, {} as Response, new Context());
      expect(getMiddlewareContext(req)).to.equal(ctx);
    });
  });

  describe('MiddlewareMixin', () => {
    it('throws if the super class does not extend Context', () => {
      class NotAContext {}
      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        MiddlewareMixin(NotAContext as any),
      ).to.throw('The super class does not extend from Context');
    });

    it('throws if an empty list of Express handlers is registered', () => {
      class MyContext extends MiddlewareMixin(Context) {}
      const ctx = new MyContext();
      expect(() => ctx.expressMiddleware('middleware.empty', [])).to.throw(
        'No Express middleware handler function is provided.',
      );
    });

    it('registers a list of Express handlers by binding key', () => {
      class MyContext extends MiddlewareMixin(Context) {}
      const ctx = new MyContext();
      const binding = ctx.expressMiddleware('middleware.list', [
        (_req, _res, next) => next(),
        (_req, _res, next) => next(),
      ]);
      expect(binding.key).to.equal('middleware.list');
    });
  });

  describe('MiddlewareView', () => {
    it('exposes middleware binding keys sorted by group', () => {
      class MyContext extends MiddlewareMixin(Context) {}
      const ctx = new MyContext();
      ctx.expressMiddleware('middleware.b', [(_r, _s, next) => next()], {
        key: 'middleware.b',
        group: 'second',
      });
      ctx.expressMiddleware('middleware.a', [(_r, _s, next) => next()], {
        key: 'middleware.a',
        group: 'first',
      });
      const view = new MiddlewareView(ctx, {
        orderedGroups: ['first', 'second'],
      });
      try {
        expect(view.middlewareBindingKeys).to.eql([
          'middleware.a',
          'middleware.b',
        ]);
      } finally {
        view.close();
      }
    });

    it('rebuilds the keys on refresh()', () => {
      class MyContext extends MiddlewareMixin(Context) {}
      const ctx = new MyContext();
      ctx.expressMiddleware('middleware.a', [(_r, _s, next) => next()], {
        key: 'middleware.a',
        group: 'first',
      });
      const view = new MiddlewareView(ctx, {
        orderedGroups: ['first', 'second'],
      });
      try {
        expect(view.middlewareBindingKeys).to.eql(['middleware.a']);
        ctx.expressMiddleware('middleware.b', [(_r, _s, next) => next()], {
          key: 'middleware.b',
          group: 'second',
        });
        view.refresh();
        expect(view.middlewareBindingKeys).to.eql([
          'middleware.a',
          'middleware.b',
        ]);
      } finally {
        view.close();
      }
    });

    it('invokes the validate() callback with the sorted groups', () => {
      const ctx = new Context();
      let validated: string[] | undefined;
      const view = new MiddlewareView(ctx, {
        orderedGroups: ['first', 'second'],
        validate: groups => {
          validated = groups;
        },
      });
      try {
        expect(validated).to.eql(['first', 'second']);
      } finally {
        view.close();
      }
    });

    it('propagates errors thrown by validate()', () => {
      const ctx = new Context();
      expect(
        () =>
          new MiddlewareView(ctx, {
            orderedGroups: ['first'],
            validate: () => {
              throw new Error('invalid groups');
            },
          }),
      ).to.throw('invalid groups');
    });

    it('builds the keys when debug logging is enabled', () => {
      const ctx = new Context();
      const namespaces = debugFactory.disable();
      const originalLog = debugFactory.log;
      // Keep the test output clean
      debugFactory.log = () => {};
      debugFactory.enable('loopback:middleware');
      try {
        const view = new MiddlewareView(ctx, {orderedGroups: ['first']});
        expect(view.middlewareBindingKeys).to.eql([]);
        view.close();
      } finally {
        debugFactory.log = originalLog;
        debugFactory.enable(namespaces);
      }
    });
  });

  describe('InvokeMiddlewareProvider', () => {
    function givenMiddlewareContext(parent: Context): MiddlewareContext {
      const req = {method: 'GET', url: '/'} as Request;
      return new MiddlewareContext(req, {} as Response, parent);
    }

    it('invokes a list of Express handlers when an array is provided', async () => {
      const ctx = new Context();
      const binding = createBindingFromClass(InvokeMiddlewareProvider);
      ctx.add(binding);
      const invoke = await ctx.get<InvokeMiddleware>(binding.key);
      const calls: string[] = [];

      const result = await invoke(givenMiddlewareContext(ctx), [
        (_req, _res, next) => {
          calls.push('h1');
          next();
        },
        (_req, _res, next) => {
          calls.push('h2');
          next();
        },
      ]);

      expect(calls).to.eql(['h1', 'h2']);
      // The response was not finished by the handlers
      expect(result).to.be.false();
    });

    it('falls back to the default chain and ordered groups', async () => {
      const ctx = new Context();
      const binding = createBindingFromClass(InvokeMiddlewareProvider);
      ctx.add(binding);
      const invoke = await ctx.get<InvokeMiddleware>(binding.key);

      // No middleware is registered - the default chain is a no-op
      await expect(
        Promise.resolve(invoke(givenMiddlewareContext(ctx))),
      ).to.be.fulfilled();
    });

    it('uses the chain and groups passed in the options', async () => {
      const ctx = new Context();
      const binding = createBindingFromClass(InvokeMiddlewareProvider);
      ctx.add(binding);
      const invoke = await ctx.get<InvokeMiddleware>(binding.key);
      const calls: string[] = [];
      const key = 'middleware.custom';
      ctx
        .bind(key)
        .to(async (_ctx: MiddlewareContext, next: () => unknown) => {
          calls.push('custom');
          return next();
        })
        .tag({extensionFor: 'custom-chain', group: 'g1'});

      await invoke(givenMiddlewareContext(ctx), {
        chain: 'custom-chain',
        orderedGroups: ['g1'],
      });

      expect(calls).to.eql(['custom']);
    });
  });

  describe('sortListOfGroups()', () => {
    it('sorts groups when debug logging is enabled', () => {
      const namespaces = debugFactory.disable();
      const originalLog = debugFactory.log;
      // Keep the test output clean
      debugFactory.log = () => {};
      debugFactory.enable('loopback:middleware');
      try {
        expect(sortListOfGroups(['a', 'b'], ['b', 'c'])).to.eql([
          'a',
          'b',
          'c',
        ]);
      } finally {
        debugFactory.log = originalLog;
        debugFactory.enable(namespaces);
      }
    });

    it('ignores lists with fewer than two groups', () => {
      expect(sortListOfGroups(['a'], ['b', 'c'])).to.eql(['b', 'c']);
    });
  });
});
