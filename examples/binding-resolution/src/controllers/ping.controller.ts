// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-binding-resolution
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Binding, BindingScope, Context, inject} from '@loopback/core';
import {
  get,
  RequestContext,
  ResponseObject,
  RestBindings,
} from '@loopback/rest';
import {LOGGER_SERVICE} from '../keys';
import {bindingScope, logContext, Logger, logContexts} from '../util';

/**
 * OpenAPI response for ping()
 */
const PING_RESPONSE: ResponseObject = {
  description: 'Ping Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'PingResponse',
        properties: {
          greeting: {type: 'string'},
          date: {type: 'string'},
          url: {type: 'string'},
          headers: {
            type: 'object',
            properties: {
              'Content-Type': {type: 'string'},
            },
            additionalProperties: true,
          },
        },
      },
    },
  },
};

/**
 * A simple controller to bounce back http requests
 */
@bind({scope: bindingScope(BindingScope.TRANSIENT)})
export class PingController {
  constructor(
    // Inject the resolution context and current binding for logging purpose
    @inject.context()
    resolutionCtx: Context,
    @inject.binding()
    private binding: Binding<unknown>,

    // Inject a logger service - it will be the request logger as the binding
    // scope for `PingController` is default to `TRANSIENT`.
    @inject(LOGGER_SERVICE)
    private logger: Logger,
  ) {
    logContexts(resolutionCtx, binding, this.logger);
  }

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': PING_RESPONSE,
    },
  })
  ping(
    // Use method parameter injection to receive the request context
    // This works regardless of the binding scope for `PingController`
    @inject(RestBindings.Http.CONTEXT) requestCtx: RequestContext,
  ): object {
    logContext('Request', requestCtx, this.binding, this.logger);
    // Reply with a greeting, the current time, the url, and request headers
    const result = {
      greeting: 'Hello from LoopBack',
      date: new Date(),
      url: requestCtx.request.url,
      headers: {...requestCtx.request.headers},
    };
    this.logger('Response', result);
    return result;
  }
}
