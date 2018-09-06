// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as express from 'express';
import {MiddlewareList} from '../../src/middleware-phase';
import {RequestHandler, ErrorRequestHandler} from 'express-serve-static-core';
import {supertest, expect} from '@loopback/testlab';

describe('Express middleware phases', () => {
  let app: express.Application;
  let middlewareChain: MiddlewareList;

  beforeEach(() => {
    app = express();
    middlewareChain = new MiddlewareList(['initial', 'auth', 'route']);
  });

  it('registers middleware by phase', async () => {
    const steps: string[] = [];
    middlewareChain.middleware(
      'route',
      '/',
      givenMiddleware('route-1', steps),
      givenMiddleware('route-2', steps),
    );
    middlewareChain.middleware(
      'initial',
      '/',
      givenMiddleware('initial-1', steps),
      givenMiddleware('initial-2', steps),
    );
    app.use(middlewareChain.asHandler());
    app.use((req, res) => {
      res.json({steps});
    });

    await supertest(app)
      .get('/')
      .expect(200, {steps});

    expect(steps).to.eql(['initial-1', 'initial-2', 'route-1', 'route-2']);
  });

  it('registers middleware by phase and path', async () => {
    const steps: string[] = [];
    middlewareChain.middleware(
      'route',
      '/foo',
      givenMiddleware('route-1', steps),
    );
    middlewareChain.middleware(
      'initial',
      '/',
      givenMiddleware('initial-1', steps),
      givenMiddleware('initial-2', steps),
    );
    middlewareChain.middleware(
      'route',
      '/bar',
      givenMiddleware('route-2', steps),
    );
    app.use(middlewareChain.asHandler());
    app.use((req, res) => {
      res.json({steps});
    });

    const test = supertest(app);
    await test.get('/foo').expect(200, {steps});
    expect(steps).to.eql(['initial-1', 'initial-2', 'route-1']);

    // Reset steps
    steps.splice(0, steps.length);
    await test.get('/bar').expect(200, {steps});
    expect(steps).to.eql(['initial-1', 'initial-2', 'route-2']);
  });

  it('registers error and final middleware', async () => {
    const steps: string[] = [];
    middlewareChain.middleware(
      'route',
      '/foo',
      givenMiddleware('route-1', steps),
    );
    middlewareChain.middleware(
      'initial',
      '/',
      givenMiddleware('initial-1', steps),
    );
    middlewareChain.middleware('auth', '/foo', (req, res, next) => {
      steps.push('auth');
      next(new Error('not authenticated'));
    });

    middlewareChain.errorMiddleware(
      '/',
      givenErrorMiddleware('error-1', steps),
    );
    middlewareChain.finalMiddleware('/', givenMiddleware('final-1', steps));

    app.use(middlewareChain.asHandler());

    const test = supertest(app);
    await test.get('/foo').expect(401);

    expect(steps).to.eql(['initial-1', 'auth', 'error-1', 'final-1']);
  });
});

function givenMiddleware(name: string, steps: string[]): RequestHandler {
  return (req, res, next) => {
    steps.push(name);
    next();
  };
}

function givenErrorMiddleware(
  name: string,
  steps: string[],
): ErrorRequestHandler {
  return (err, req, res, next) => {
    steps.push(name);
    res.status(401).json({error: err.message});
  };
}
