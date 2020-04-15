// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import HttpErrors from 'http-errors';
import {ExpressMiddlewareFactory} from '../..';
import {SpyConfig} from './spy-config';

const debug = debugFactory('loopback:middleware:spy');

/**
 * An Express middleware factory function that creates a handler to spy on
 * requests
 */
const spyMiddlewareFactory: ExpressMiddlewareFactory<SpyConfig> = config => {
  const options: SpyConfig = {action: 'log', ...config};
  return function spy(req, res, next) {
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
