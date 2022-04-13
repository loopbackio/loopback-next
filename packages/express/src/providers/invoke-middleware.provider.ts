// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  config,
  CoreTags,
  extensionPoint,
  inject,
} from '@loopback/core';
import debugFactory from 'debug';
import {DEFAULT_MIDDLEWARE_GROUP} from '../keys';
import {invokeExpressMiddleware, invokeMiddleware} from '../middleware';
import {
  DEFAULT_MIDDLEWARE_CHAIN,
  ExpressRequestHandler,
  InvokeMiddleware,
  InvokeMiddlewareOptions,
  MiddlewareContext,
} from '../types';
const debug = debugFactory('loopback:rest:middleware');

/**
 * Extension point for middleware to be run as part of the sequence actions
 */
@extensionPoint(DEFAULT_MIDDLEWARE_CHAIN)
export class InvokeMiddlewareProvider {
  static value(
    /**
     * Inject the binding so that we can access `extensionPoint` tag
     */
    @inject.binding()
    binding: Binding<InvokeMiddleware>,

    /**
     * Default options for invoking the middleware chain
     */
    @config()
    defaultOptions: InvokeMiddlewareOptions = {
      chain: DEFAULT_MIDDLEWARE_CHAIN,
      orderedGroups: ['cors', 'apiSpec', DEFAULT_MIDDLEWARE_GROUP],
    },
  ): InvokeMiddleware {
    debug('Binding', binding);
    debug('Default options', defaultOptions);
    const invokeMiddlewareFn: InvokeMiddleware = (
      middlewareCtx: MiddlewareContext,
      optionsOrHandlers?: InvokeMiddlewareOptions | ExpressRequestHandler[],
    ) => {
      if (Array.isArray(optionsOrHandlers)) {
        return this.action(middlewareCtx, optionsOrHandlers);
      }
      const options = optionsOrHandlers;
      let chain = options?.chain;
      const orderedGroups = options?.orderedGroups;
      chain =
        chain ??
        binding?.tagMap[CoreTags.EXTENSION_POINT] ??
        defaultOptions.chain;
      const middlewareOptions = {
        ...options,
        chain,
        orderedGroups: orderedGroups ?? defaultOptions.orderedGroups,
      };
      debug('Invoke middleware with', middlewareOptions);
      return this.action(middlewareCtx, middlewareOptions);
    };
    return invokeMiddlewareFn;
  }

  static async action(
    middlewareCtx: MiddlewareContext,
    optionsOrHandlers?: InvokeMiddlewareOptions | ExpressRequestHandler[],
  ) {
    if (Array.isArray(optionsOrHandlers)) {
      return invokeExpressMiddleware(middlewareCtx, ...optionsOrHandlers);
    }
    return invokeMiddleware(middlewareCtx, optionsOrHandlers);
  }
}
