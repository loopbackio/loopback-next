// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingScope, Context} from '@loopback/core';
import {Request} from '@loopback/rest';
import debugFactory from 'debug';

const debug = debugFactory('loopback:example:binding-resolution');

/**
 * Log function interface
 */
export type Logger = typeof console.log;

/**
 * Log the given resolution context/binding
 * @param currentCtx - Current context object
 * @param binding - Current binding
 * @param logger - An optional log function
 */
export function logContexts(
  currentCtx: Context,
  binding: Binding<unknown>,
  logger: Logger = debug,
) {
  const ownerCtx = currentCtx.getOwnerContext(binding.key);
  logContext('Owner', ownerCtx, binding, logger);
  logContext('Current', currentCtx, binding, logger);
}

/**
 * Log the given context/binding
 * @param type - Context type
 * @param ctx - Context object
 * @param binding - Current binding
 * @param logger - An optional log function
 */
export function logContext(
  type: string,
  ctx: Context | undefined,
  binding: Binding<unknown>,
  logger: Logger = debug,
) {
  logger(
    `[%s%s] ${type} context: %s`,
    binding.key,
    binding.scope === BindingScope.SINGLETON ? '*' : '',
    ctx?.name,
  );
}

/**
 * Log the given HTTP request
 * @param request HTTP request object
 * @param logger An optional log function
 */
export function logRequest(request: Request, logger: Logger = debug) {
  logger(
    'Request: %s %s',
    request.method,
    request.originalUrl,
    request.headers,
  );
}

export function log(message: string, ...args: unknown[]) {
  debug(message, ...args);
}

/**
 * Set binding scope based on the `BINDING_SCOPE` environment variable. This is
 * purely used for the purpose of demonstration to switch between two scopes. It
 * is not recommended for typical applications, which should determine the binding
 * scope based on the state requirement.
 */
export function bindingScope(defaultScope = BindingScope.SINGLETON) {
  return (process.env.BINDING_SCOPE ?? defaultScope).toLowerCase() ===
    BindingScope.SINGLETON.toLowerCase()
    ? BindingScope.SINGLETON
    : BindingScope.TRANSIENT;
}
