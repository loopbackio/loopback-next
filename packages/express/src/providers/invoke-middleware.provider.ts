// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  config,
  CoreTags,
  extensionPoint,
  inject,
  Provider,
} from '@loopback/core';
import debugFactory from 'debug';
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
export class InvokeMiddlewareProvider implements Provider<InvokeMiddleware> {
  /**
   * Inject the binding so that we can access `extensionPoint` tag
   */
  @inject.binding()
  protected binding: Binding<InvokeMiddleware>;

  /**
   * Default options for invoking the middleware chain
   */
  @config()
  protected defaultOptions: InvokeMiddlewareOptions = {
    chain: DEFAULT_MIDDLEWARE_CHAIN,
    orderedGroups: ['cors', 'apiSpec', ''],
  };

  value(): InvokeMiddleware {
    debug('Binding', this.binding);
    return (
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
        this.binding?.tagMap[CoreTags.EXTENSION_POINT] ??
        this.defaultOptions.chain;
      return this.action(middlewareCtx, {
        chain,
        orderedGroups: orderedGroups ?? this.defaultOptions.orderedGroups,
      });
    };
  }

  async action(
    middlewareCtx: MiddlewareContext,
    optionsOrHandlers?: InvokeMiddlewareOptions | ExpressRequestHandler[],
  ) {
    if (Array.isArray(optionsOrHandlers)) {
      return invokeExpressMiddleware(middlewareCtx, ...optionsOrHandlers);
    }
    return invokeMiddleware(middlewareCtx, optionsOrHandlers);
  }
}
