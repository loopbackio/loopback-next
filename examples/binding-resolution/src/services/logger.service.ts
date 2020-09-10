// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  BindingScope,
  Context,
  ContextTags,
  inject,
  Provider,
} from '@loopback/core';
import {RequestContext, RestBindings} from '@loopback/rest';
import {format} from 'util';
import {LOGGER_SERVICE} from '../keys';
import {log, Logger, logContexts} from '../util';

/**
 * A default stateless logger
 *
 * @remarks
 *
 * The logger implementation is stateless. We use SINGLETON scope so that only
 * one instance will be created to minimize the overhead.
 */
@bind({
  scope: BindingScope.SINGLETON,
  // Set binding key to `LOGGER_SERVICE`
  tags: {[ContextTags.KEY]: LOGGER_SERVICE},
})
export class LoggerService implements Provider<Logger> {
  constructor(
    // Inject the resolution context and current binding for logging purpose
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,
  ) {
    logContexts(resolutionCtx, binding);
  }

  value() {
    const logger: Logger = (message: string, ...args: unknown[]) => {
      log('<<%s>> %s', this.binding.key, format(message, ...args));
    };
    return logger;
  }
}

/**
 * A logger bound to a given request context
 *
 * @remarks
 * The binding scope is set to be `TRANSIENT` or `CONTEXT` so that a new
 * instance will be created for each request and the corresponding request
 * context can be injected into the request logger.
 */
@bind({scope: BindingScope.TRANSIENT})
export class RequestLoggerService implements Provider<Logger> {
  constructor(
    // Inject the resolution context and current binding for logging purpose
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,

    // Inject the request context. This is only possible when the
    // `RequestLoggerService` is instantiated within the request context.
    @inject(RestBindings.Http.CONTEXT)
    private requestCtx: RequestContext,
  ) {
    logContexts(resolutionCtx, binding);
  }

  value() {
    const logger: Logger = (message: string, ...args: unknown[]) => {
      log(
        '<<%s>> (%s %s) %s',
        this.binding.key,
        this.requestCtx.request.method,
        this.requestCtx.request.originalUrl,
        format(message, ...args),
      );
    };
    return logger;
  }
}
