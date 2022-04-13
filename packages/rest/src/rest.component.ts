// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Application,
  Binding,
  Component,
  Constructor,
  CoreBindings,
  CoreTags,
  createBindingFromClass,
  inject,
  ProviderMap,
  Server,
} from '@loopback/core';
import {InvokeMiddlewareProvider} from '@loopback/express';
import {createEmptyApiSpec} from '@loopback/openapi-v3';
import {
  JsonBodyParser,
  RequestBodyParser,
  StreamBodyParser,
  TextBodyParser,
  UrlEncodedBodyParser,
} from './body-parsers';
import {RawBodyParser} from './body-parsers/body-parser.raw';
import {RestBindings, RestTags} from './keys';
import {
  FindRouteMiddlewareProvider,
  FindRouteProvider,
  InvokeMethodMiddlewareProvider,
  InvokeMethodProvider,
  LogErrorProvider,
  ParseParamsMiddlewareProvider,
  ParseParamsProvider,
  RejectProvider,
  SendProvider,
  SendResponseMiddlewareProvider,
} from './providers';
import {
  createBodyParserBinding,
  RestServer,
  RestServerConfig,
} from './rest.server';
import {ConsolidationEnhancer} from './spec-enhancers/consolidate.spec-enhancer';
import {InfoSpecEnhancer} from './spec-enhancers/info.spec-enhancer';
import {AjvFactoryProvider} from './validation/ajv-factory.provider';

export class RestComponent implements Component {
  providers: ProviderMap = {
    [RestBindings.AJV_FACTORY.key]: AjvFactoryProvider,
  };
  /**
   * Add built-in body parsers
   */
  bindings: Binding[] = [
    ...createActionBindings(),
    // FIXME(rfeng): We now register request body parsers in TRANSIENT scope
    // so that they can be bound at application or server level
    Binding.bind(RestBindings.REQUEST_BODY_PARSER).toClass(RequestBodyParser),
    createBodyParserBinding(
      JsonBodyParser,
      RestBindings.REQUEST_BODY_PARSER_JSON,
    ),
    createBodyParserBinding(
      TextBodyParser,
      RestBindings.REQUEST_BODY_PARSER_TEXT,
    ),
    createBodyParserBinding(
      UrlEncodedBodyParser,
      RestBindings.REQUEST_BODY_PARSER_URLENCODED,
    ),
    createBodyParserBinding(
      RawBodyParser,
      RestBindings.REQUEST_BODY_PARSER_RAW,
    ),
    createBodyParserBinding(
      StreamBodyParser,
      RestBindings.REQUEST_BODY_PARSER_STREAM,
    ),
    createBindingFromClass(InfoSpecEnhancer),
    createBindingFromClass(ConsolidationEnhancer),

    ...getRestMiddlewareBindings(),
  ];
  servers: {
    [name: string]: Constructor<Server>;
  } = {
    RestServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(RestBindings.CONFIG) config?: RestComponentConfig,
  ) {
    // Register the `InvokeMiddleware` with default to `ACTION_MIDDLEWARE_CHAIN`
    // to keep backward compatibility with action based sequence
    const invokeMiddlewareActionBinding = createBindingFromClass(
      InvokeMiddlewareProvider,
      {
        key: RestBindings.SequenceActions.INVOKE_MIDDLEWARE,
      },
    ).tag({[CoreTags.EXTENSION_POINT]: RestTags.ACTION_MIDDLEWARE_CHAIN});
    app.add(invokeMiddlewareActionBinding);

    // Register the `InvokeMiddleware` with default to `DEFAULT_MIDDLEWARE_CHAIN`
    // for the middleware based sequence
    const invokeMiddlewareServiceBinding = createBindingFromClass(
      InvokeMiddlewareProvider,
      {
        key: RestBindings.INVOKE_MIDDLEWARE_SERVICE,
      },
    ).tag({[CoreTags.EXTENSION_POINT]: RestTags.REST_MIDDLEWARE_CHAIN});
    app.add(invokeMiddlewareServiceBinding);

    const apiSpec = createEmptyApiSpec();
    // Merge the OpenAPI `servers` spec from the config into the empty one
    if (config?.openApiSpec?.servers) {
      Object.assign(apiSpec, {servers: config.openApiSpec.servers});
    }
    app.bind(RestBindings.API_SPEC).to(apiSpec);
  }
}

function getRestMiddlewareBindings() {
  return [
    SendResponseMiddlewareProvider,
    FindRouteMiddlewareProvider,
    ParseParamsMiddlewareProvider,
    InvokeMethodMiddlewareProvider,
  ].map(cls => createBindingFromClass(cls));
}

function createActionBindings() {
  const bindings: Binding[] = [];
  const providers = {
    [RestBindings.SequenceActions.LOG_ERROR.key]: LogErrorProvider,
    [RestBindings.SequenceActions.FIND_ROUTE.key]: FindRouteProvider,
    [RestBindings.SequenceActions.INVOKE_METHOD.key]: InvokeMethodProvider,
    [RestBindings.SequenceActions.REJECT.key]: RejectProvider,
    [RestBindings.SequenceActions.PARSE_PARAMS.key]: ParseParamsProvider,
    [RestBindings.SequenceActions.SEND.key]: SendProvider,
  };
  for (const k in providers) {
    bindings.push(createBindingFromClass(providers[k], {key: k}));
  }
  return bindings;
}

// TODO(kevin): Extend this interface def to include multiple servers?
export type RestComponentConfig = RestServerConfig;
