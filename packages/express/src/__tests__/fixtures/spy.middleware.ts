// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
import debugFactory from 'debug';
import HttpErrors from 'http-errors';
import {ExpressMiddlewareFactory, MIDDLEWARE_CONTEXT} from '../..';
import {SpyConfig} from './spy-config';

const debug = debugFactory('loopback:middleware:spy');

/**
 * An Express middleware factory function that creates a handler to spy on
 * requests
 */
const spyMiddlewareFactory: ExpressMiddlewareFactory<SpyConfig> = config => {
  const options: SpyConfig = {action: 'log', ...config};
  return function spy(req, res, next) {
    expect(req).to.have.properties(MIDDLEWARE_CONTEXT);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((req as any)[MIDDLEWARE_CONTEXT].request).to.equal(req);
    debug('config', options);
    switch (options?.action) {
      case 'mock':
        debug('spy - MOCK');
        res.set('x-spy-mock', `${req.method} ${req.path}`);
        res.send('Hello, Spy');
        break;
      case 'reject':
        debug('spy - REJECT');
        res.set('x-spy-reject', `${req.method} ${req.path}`);
        next(new HttpErrors.BadRequest('Request rejected by spy'));
        break;
      default:
        debug('spy - LOG');
        res.set('x-spy-log', `${req.method} ${req.path}`);
        next();
        break;
    }
  };
};

export = spyMiddlewareFactory;
