// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/core';
import {expect, stubExpressContext} from '@loopback/testlab';
import {RequestHandler} from 'express';
import {MiddlewareAction, RequestContext} from '../../..';
import {createMiddlewareActionProvider} from '../../../actions';

describe('MiddlewareAction', () => {
  let ctx: Context;
  let reqCtx: RequestContext;

  beforeEach(givenRequestContext);

  it('wraps an express middleware that calls next synchronously', async () => {
    const handler: RequestHandler = (req, res, next) => {
      res.set('mock-header', 'mock-value');
      next();
    };
    const middlewareAction = new MiddlewareAction(handler);
    let nextCalled = false;
    await middlewareAction.intercept(reqCtx, () => {
      nextCalled = true;
    });
    expect(reqCtx.response.get('mock-header')).to.eql('mock-value');
    expect(nextCalled).to.be.true();
  });

  it('wraps an express middleware that calls next asynchronously', async () => {
    const handler: RequestHandler = (req, res, next) => {
      process.nextTick(() => {
        res.set('mock-header', 'mock-value');
        next();
      });
    };
    const middlewareAction = new MiddlewareAction(handler);
    let nextCalled = false;
    await middlewareAction.intercept(reqCtx, () => {
      nextCalled = true;
    });
    expect(reqCtx.response.get('mock-header')).to.eql('mock-value');
    expect(nextCalled).to.be.true();
  });

  it('wraps an express middleware without next', async () => {
    const handlerWithoutNext: RequestHandler = (req, res) => {
      res.set('mock-header', 'mock-value');
      res.send('done');
    };
    const middlewareAction = new MiddlewareAction(handlerWithoutNext);
    let nextCalled = false;
    await middlewareAction.intercept(reqCtx, () => {
      nextCalled = true;
    });
    expect(reqCtx.response.get('mock-header')).to.eql('mock-value');
    expect(nextCalled).to.be.true();
  });

  it('catches error reported by the middleware via next(err)', async () => {
    const handlerThrowingError: RequestHandler = (req, res, next) => {
      process.nextTick(() => next(new Error('error from handler')));
    };
    const middlewareAction = new MiddlewareAction(handlerThrowingError);
    let nextCalled = false;
    await expect(
      middlewareAction.intercept(reqCtx, () => {
        nextCalled = true;
      }),
    ).to.be.rejectedWith(/error from handler/);
    expect(nextCalled).to.be.false();
  });

  it('catches error thrown by the middleware', async () => {
    const handlerThrowingError: RequestHandler = (req, res, next) => {
      throw new Error('error from handler');
    };
    const middlewareAction = new MiddlewareAction(handlerThrowingError);
    let nextCalled = false;
    await expect(
      middlewareAction.intercept(reqCtx, () => {
        nextCalled = true;
      }),
    ).to.be.rejectedWith(/error from handler/);
    expect(nextCalled).to.be.false();
  });

  it('creates a provider class for MiddlewareAction', async () => {
    const providerClass = createMiddlewareActionProvider('cors');
    const corsKey = 'middleware.cors';
    ctx.configure(corsKey).to({origin: '*'});
    ctx.bind(corsKey).toProvider(providerClass);
    const action = await ctx.get(corsKey);
    expect(action).be.instanceOf(MiddlewareAction);
  });

  function givenRequestContext() {
    ctx = new Context('server');
    const httpCtx = stubExpressContext({url: 'http://localhost:3000'});
    reqCtx = new RequestContext(
      httpCtx.request,
      httpCtx.response,
      ctx,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as any,
    );
  }
});
