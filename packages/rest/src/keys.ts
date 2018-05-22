// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';
import {BindingKey, Context} from '@loopback/context';
import {OpenApiSpec} from '@loopback/openapi-v3-types';

import {HttpHandler} from './http-handler';
import {SequenceHandler} from './sequence';
import {
  BindElement,
  FindRoute,
  GetFromContext,
  InvokeMethod,
  LogError,
  Request,
  Response,
  ParseParams,
  Reject,
  Send,
} from './types';

// NOTE(bajtos) The following import is required to satisfy TypeScript compiler
// tslint:disable-next-line:no-unused-variable
import {OpenAPIObject} from '@loopback/openapi-v3-types';

/**
 * RestServer-specific bindings
 */
export namespace RestBindings {
  /**
   * Binding key for setting and injecting RestComponentConfig
   */
  export const CONFIG = CoreBindings.APPLICATION_CONFIG.deepProperty('rest');
  /**
   * Binding key for setting and injecting the host name of RestServer
   */
  export const HOST = BindingKey.create<string | undefined>('rest.host');
  /**
   * Binding key for setting and injecting the port number of RestServer
   */
  export const PORT = BindingKey.create<number>('rest.port');
  /**
   * Binding key for setting and injecting the URL of RestServer
   */
  export const URL = BindingKey.create<string>('rest.url');
  /**
   * Binding key for setting and injecting the protocol of RestServer
   */
  export const PROTOCOL = BindingKey.create<'http' | 'https'>('rest.protocol');
  /**
   * Internal binding key for http-handler
   */
  export const HANDLER = BindingKey.create<HttpHandler>('rest.handler');

  /**
   * Binding key for setting and injecting an OpenAPI spec
   */
  export const API_SPEC = BindingKey.create<OpenApiSpec>('rest.apiSpec');
  /**
   * Binding key for setting and injecting a Sequence
   */
  export const SEQUENCE = BindingKey.create<SequenceHandler>('rest.sequence');

  /**
   * Bindings for potential actions that could be used in a sequence
   */
  export namespace SequenceActions {
    /**
     * Binding key for setting and injecting a route finding function
     */
    export const FIND_ROUTE = BindingKey.create<FindRoute>(
      'rest.sequence.actions.findRoute',
    );
    /**
     * Binding key for setting and injecting a parameter parsing function
     */
    export const PARSE_PARAMS = BindingKey.create<ParseParams>(
      'rest.sequence.actions.parseParams',
    );
    /**
     * Binding key for setting and injecting a controller route invoking function
     */
    export const INVOKE_METHOD = BindingKey.create<InvokeMethod>(
      'rest.sequence.actions.invokeMethod',
    );
    /**
     * Binding key for setting and injecting an error logging function
     */
    export const LOG_ERROR = BindingKey.create<LogError>(
      'rest.sequence.actions.logError',
    );
    /**
     * Binding key for setting and injecting a response writing function
     */
    export const SEND = BindingKey.create<Send>('rest.sequence.actions.send');
    /**
     * Binding key for setting and injecting a bad response writing function
     */
    export const REJECT = BindingKey.create<Reject>(
      'rest.sequence.actions.reject',
    );
  }

  /**
   * Binding key for setting and injecting a wrapper function for retrieving
   * values from a given context
   */
  export const GET_FROM_CONTEXT = BindingKey.create<GetFromContext>(
    'getFromContext',
  );
  /**
   * Binding key for setting and injecting a wrapper function for setting values
   * on a given context
   */
  export const BIND_ELEMENT = BindingKey.create<BindElement>('bindElement');

  /**
   * Request-specific bindings
   */
  export namespace Http {
    /**
     * Binding key for setting and injecting the http request
     */
    export const REQUEST = BindingKey.create<Request>('rest.http.request');
    /**
     * Binding key for setting and injecting the http response
     */
    export const RESPONSE = BindingKey.create<Response>('rest.http.response');
    /**
     * Binding key for setting and injecting the http request context
     */
    export const CONTEXT = BindingKey.create<Context>(
      'rest.http.request.context',
    );
  }
}
