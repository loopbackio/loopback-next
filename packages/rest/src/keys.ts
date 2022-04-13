// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingKey, Context, CoreBindings} from '@loopback/core';
import {DEFAULT_MIDDLEWARE_CHAIN, InvokeMiddleware} from '@loopback/express';
import {HttpProtocol} from '@loopback/http-server';
import {OpenApiSpec, OperationObject} from '@loopback/openapi-v3';
import https from 'https';
import {ErrorWriterOptions} from 'strong-error-handler';
import {BodyParser, RequestBodyParser} from './body-parsers';
import {HttpHandler} from './http-handler';
import {RestServer, RestServerConfig} from './rest.server';
import {ResolvedRoute, RestRouter, RestRouterOptions} from './router';
import {SequenceHandler} from './sequence';
import {
  AjvFactory,
  FindRoute,
  InvokeMethod,
  LogError,
  OperationArgs,
  OperationRetval,
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
  export const CONFIG: BindingKey<RestServerConfig> =
    CoreBindings.APPLICATION_CONFIG.deepProperty('rest');
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
  export const HTTPS_OPTIONS =
    BindingKey.create<https.ServerOptions>('rest.httpsOptions');

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
   * See https://github.com/loopbackio/strong-error-handler#options for
   * the list of available options. Please note that the flag `log` is not used
   * by `@loopback/rest`.
   */
  export const ERROR_WRITER_OPTIONS = BindingKey.create<ErrorWriterOptions>(
    'rest.errorWriterOptions',
  );

  /**
   * Binding key for request body parser options
   */
  export const REQUEST_BODY_PARSER_OPTIONS =
    BindingKey.create<RequestBodyParserOptions>(
      'rest.requestBodyParserOptions',
    );

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
   * Binding key for AJV
   */
  export const AJV_FACTORY = BindingKey.create<AjvFactory>(
    bodyParserBindingKey('rest.ajvFactory'),
  );

  /**
   * Binding key for setting and injecting an OpenAPI spec
   */
  export const API_SPEC: BindingKey<OpenApiSpec> =
    BindingKey.create<OpenApiSpec>('rest.apiSpec');

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
   * Binding key for setting and injecting a `invokeMiddleware` function for
   * middleware based sequence
   */
  export const INVOKE_MIDDLEWARE_SERVICE = BindingKey.create<InvokeMiddleware>(
    'rest.invokeMiddleware',
  );

  /**
   * Bindings for potential actions that could be used in a sequence
   */
  export namespace SequenceActions {
    /**
     * Binding key for setting and injecting `invokeMiddleware` function
     */
    export const INVOKE_MIDDLEWARE = BindingKey.create<InvokeMiddleware>(
      'rest.sequence.actions.invokeMiddleware',
    );
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

  export namespace Operation {
    export const ROUTE = BindingKey.create<ResolvedRoute>(
      'rest.operation.route',
    );

    export const PARAMS = BindingKey.create<OperationArgs>(
      'rest.operation.params',
    );

    export const RETURN_VALUE = BindingKey.create<OperationRetval>(
      'rest.operation.returnValue',
    );
  }

  /**
   * Request-specific bindings
   */
  export namespace Http {
    /**
     * Binding key for setting and injecting the http request
     */
    export const REQUEST: BindingKey<Request> =
      BindingKey.create<Request>('rest.http.request');
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

  /**
   * Namespace for REST routes
   */
  export const ROUTES = 'routes';
}

/**
 * Binding tags for RestServer
 */
export namespace RestTags {
  /**
   * Binding tag to identify REST routes
   */
  export const REST_ROUTE = 'restRoute';

  /**
   * Binding tag for the REST route verb
   */
  export const ROUTE_VERB = 'restRouteVerb';

  /**
   * Binding tag for the REST route path
   */
  export const ROUTE_PATH = 'restRoutePath';

  /**
   * Binding tag to identify controller based REST routes
   */
  export const CONTROLLER_ROUTE = 'controllerRoute';

  /**
   * Binding tag for controller route bindings to represent the controller
   * binding key
   */
  export const CONTROLLER_BINDING = 'controllerBinding';

  export const AJV_KEYWORD = 'ajvKeyword';
  export const AJV_FORMAT = 'ajvFormat';

  export const REST_MIDDLEWARE_CHAIN = DEFAULT_MIDDLEWARE_CHAIN;

  /**
   * Legacy middleware chain for action-based REST sequence
   */
  export const ACTION_MIDDLEWARE_CHAIN = 'middlewareChain.rest.actions';
}
