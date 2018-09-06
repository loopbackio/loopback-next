// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {PhaseList, HandlerChain} from '@loopback/phase';
import {RequestHandler, ErrorRequestHandler} from 'express';
import {RequestContext} from './request-context';
import {PathParams} from 'express-serve-static-core';
import * as pathToRegExp from 'path-to-regexp';
const debug = require('debug')('loopback:rest:middleware');

/**
 * A registry for Express middleware by phase
 */
export class MiddlewareList {
  private phaseList: PhaseList;
  constructor(phaseNames: string[] = []) {
    this.phaseList = new PhaseList(phaseNames);
  }

  /**
   * Register handlers by phase
   * @param phaseName Name of the phase
   * @param path Path filter
   * @param handlers Middleware handlers
   */
  middleware(
    phaseName: string,
    path: PathParams,
    ...handlers: RequestHandler[]
  ): this {
    const re = pathToRegExp(path, [], {end: false});
    for (const handler of handlers) {
      this.phaseList.registerHandler(
        phaseName,
        async (ctx: RequestContext, chain: HandlerChain) => {
          debug('Request: %s pattern: %s', ctx.request.url, re);
          if (!re.test(ctx.request.path)) {
            debug('Skipping %s', ctx.request.path);
            await chain.next();
            return;
          }
          debug('Invoking middleware %s', handler.name);
          let nextPromise: Promise<void> | undefined = undefined;
          // tslint:disable-next-line:no-any
          handler(ctx.request, ctx.response, (err?: any) => {
            // Keep the callback as a sync function as expected by express
            // middleware
            if (!err) {
              // Track the result of chain.next as it can be rejected
              nextPromise = chain.next();
            } else {
              chain.throw(err);
            }
          });
          // Catch the rejected promise if necessary
          // tslint:disable-next-line:await-promise
          if (nextPromise) await nextPromise;
          if (!chain.done) chain.stop();
        },
      );
    }
    return this;
  }

  /**
   *
   * @param path
   * @param handlers
   */
  finalMiddleware(path: PathParams, ...handlers: RequestHandler[]) {
    this.middleware(this.phaseList.finalPhase.id, path, ...handlers);
  }

  /**
   *
   * @param path
   * @param handlers
   */
  errorMiddleware(path: PathParams, ...handlers: ErrorRequestHandler[]) {
    const re = pathToRegExp(path, [], {end: false});
    for (const handler of handlers) {
      this.phaseList.registerHandler(
        this.phaseList.errorPhase.id,
        // tslint:disable-next-line:no-any
        async (ctx: RequestContext & {error?: any}, chain: HandlerChain) => {
          debug('Request: %s pattern: %s', ctx.request.url, re);
          if (!re.test(ctx.request.path)) {
            debug('Skipping %s', ctx.request.path);
            await chain.next();
            return;
          }
          debug('Invoking error middleware %s', handler.name);
          let nextPromise: Promise<void> | undefined = undefined;
          // tslint:disable-next-line:no-any
          handler(ctx.error, ctx.request, ctx.response, (err?: any) => {
            // Keep the callback as a sync function as expected by express
            // middleware
            if (!err) {
              // Track the result of chain.next as it can be rejected
              nextPromise = chain.next();
            } else {
              chain.throw(err);
            }
          });
          // Catch the rejected promise if necessary
          // tslint:disable-next-line:await-promise
          if (nextPromise) await nextPromise;
          if (!chain.done) chain.stop();
        },
      );
    }
    return this;
  }

  /**
   * Create an express middleware from the registry
   */
  asHandler(): RequestHandler {
    return async (req, res, next) => {
      const reqCtx = new RequestContext(req, res, new Context());
      try {
        await this.phaseList.run(reqCtx);
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}
