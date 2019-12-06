// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {HttpProtocol} from '@loopback/http-server';
import {OpenApiSpec, OperationObject} from '@loopback/openapi-v3';
import https from 'https';
import {ErrorWriterOptions} from 'strong-error-handler';
import {BodyParser, RequestBodyParser} from './body-parsers';
import {HttpHandler} from './http-handler';
import {RestServer} from './rest.server';
import {RestRouter, RestRouterOptions} from './router';
import {SequenceHandler} from './sequence';
import {
  BindElement,
  FindRoute,
  GetFromContext,
  InvokeMethod,
  LogError,
  ParseParams,
  Reject,
  Request,
  RequestBodyParserOptions,
  Response,
  Send,
} from './types';

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
   * Binding key for setting and injecting the socket path of the RestServer
   */
  export const PATH = BindingKey.create<string | undefined>('rest.path');
  /**
   * Binding key for setting and injecting the URL of RestServer
   */
  export const URL = BindingKey.create<string>('rest.url');
  /**
   * Binding key for setting and injecting the protocol of RestServer
   */
  export const PROTOCOL = BindingKey.create<HttpProtocol>('rest.protocol');
  /**
   * Binding key for HTTPS options
   */
  export const HTTPS_OPTIONS = BindingKey.create<https.ServerOptions>(
    'rest.httpsOptions',
  );

  /**
   * Binding key for the server itself
   */
  export const SERVER = BindingKey.create<RestServer>('servers.RestServer');

  /**
   * Internal binding key for basePath
   */
  export const BASE_PATH = BindingKey.create<string>('rest.basePath');

  /**
   * Internal binding key for http-handler
   */
  export const HANDLER = BindingKey.create<HttpHandler>('rest.handler');

  /**
   * Internal binding key for rest router
   */
  export const ROUTER = BindingKey.create<RestRouter>('rest.router');

  export const ROUTER_OPTIONS = BindingKey.create<RestRouterOptions>(
    'rest.router.options',
  );

  /**
   * Binding key for setting and injecting Reject action's error handling
   * options.
   *
   * See https://github.com/strongloop/strong-error-handler#options for
   * the list of available options. Please note that the flag `log` is not used
   * by `@loopback/rest`.
   */
  export const ERROR_WRITER_OPTIONS = BindingKey.create<ErrorWriterOptions>(
    'rest.errorWriterOptions',
  );

  /**
   * Binding key for request body parser options
   */
  export const REQUEST_BODY_PARSER_OPTIONS = BindingKey.create<
    RequestBodyParserOptions
  >('rest.requestBodyParserOptions');

  /**
   * Binding key for request body parser
   */
  export const REQUEST_BODY_PARSER = BindingKey.create<RequestBodyParser>(
    'rest.requestBodyParser',
  );

  function bodyParserBindingKey(parser: string) {
    return `${REQUEST_BODY_PARSER}.${parser}`;
  }

  /**
   * Binding key for request json body parser
   */
  export const REQUEST_BODY_PARSER_JSON = BindingKey.create<BodyParser>(
    bodyParserBindingKey('JsonBodyParser'),
  );

  /**
   * Binding key for request urlencoded body parser
   */
  export const REQUEST_BODY_PARSER_URLENCODED = BindingKey.create<BodyParser>(
    bodyParserBindingKey('UrlEncodedBodyParser'),
  );

  /**
   * Binding key for request text body parser
   */
  export const REQUEST_BODY_PARSER_TEXT = BindingKey.create<BodyParser>(
    bodyParserBindingKey('TextBodyParser'),
  );

  /**
   * Binding key for request raw body parser
   */
  export const REQUEST_BODY_PARSER_RAW = BindingKey.create<BodyParser>(
    bodyParserBindingKey('RawBodyParser'),
  );

  /**
   * Binding key for request raw body parser
   */
  export const REQUEST_BODY_PARSER_STREAM = BindingKey.create<BodyParser>(
    bodyParserBindingKey('StreamBodyParser'),
  );

  /**
   * Binding key for setting and injecting an OpenAPI spec
   */
  export const API_SPEC = BindingKey.create<OpenApiSpec>('rest.apiSpec');

  /**
   * Binding key for setting and injecting an OpenAPI operation spec
   */
  export const OPERATION_SPEC_CURRENT = BindingKey.create<OperationObject>(
    'rest.operationSpec.current',
  );

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
