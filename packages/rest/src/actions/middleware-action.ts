// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  config,
  Constructor,
  InvocationResult,
  Next,
  Provider,
} from '@loopback/context';
import {RequestHandler} from 'express';
import {HttpContext} from '../types';
import {BaseRestAction} from './base-action';

/**
 * Wrap an Express middleware handler as RestAction
 */
export class MiddlewareAction extends BaseRestAction {
  constructor(private requestHandler: RequestHandler) {
    super();
  }

  async intercept(ctx: HttpContext, next: Next) {
    return new Promise<InvocationResult>((resolve, reject) => {
      try {
        if (this.requestHandler.length < 3) {
          // The express middleware does not call `next`
          this.requestHandler(ctx.request, ctx.response, () => {});
          resolve(next());
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.requestHandler(ctx.request, ctx.response, (err?: any) => {
          if (err) reject(err);
          else resolve(next());
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  get handler(): RequestHandler {
    return this.requestHandler;
  }
}

/**
 * Create a provider class for the middleware module
 * @param middlewareModule - Name for the middleware module, such as `cors`.
 *
 * @example
 * ```ts
 * const corsKey = 'middleware.cors';
 * const providerClass = createMiddlewareActionProvider('cors');
 * ctx.configure(corsKey).to({});
 * ctx.bind(corsKey).toProvider(providerClass);
 * ```
 */
export function createMiddlewareActionProvider(
  middlewareModule: string,
): Constructor<Provider<MiddlewareAction>> {
  const factory = require(middlewareModule);

  class MiddlewareActionProvider implements Provider<MiddlewareAction> {
    constructor(@config() private options = {}) {}
    value() {
      const handler = factory(this.options);
      return new MiddlewareAction(handler);
    }
  }
  return MiddlewareActionProvider;
}

export function createMiddlewareAction<T extends object>(
  middlewareModule: string,
  options?: T,
) {
  const factory = require(middlewareModule);
  const handler = factory(options);
  return new MiddlewareAction(handler);
}
