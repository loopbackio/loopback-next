// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Constructor,
  createBindingFromClass,
  inject,
} from '@loopback/context';
import {
  Application,
  Component,
  CoreBindings,
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
import {RestBindings} from './keys';
import {
  BindElementProvider,
  FindRouteProvider,
  GetFromContextProvider,
  InvokeMethodProvider,
  LogErrorProvider,
  ParseParamsProvider,
  RejectProvider,
  SendProvider,
} from './providers';
import {
  createBodyParserBinding,
  RestServer,
  RestServerConfig,
} from './rest.server';
import {DefaultSequence} from './sequence';
import {ConsolidationEnhancer} from './spec-enhancers/consolidate.spec-enhancer';
import {InfoSpecEnhancer} from './spec-enhancers/info.spec-enhancer';
import {AjvFactoryProvider} from './validation/ajv-factory.provider';

export class RestComponent implements Component {
  providers: ProviderMap = {
    [RestBindings.SequenceActions.LOG_ERROR.key]: LogErrorProvider,
    [RestBindings.SequenceActions.INVOKE_MIDDLEWARE
      .key]: InvokeMiddlewareProvider,
    [RestBindings.SequenceActions.FIND_ROUTE.key]: FindRouteProvider,
    [RestBindings.SequenceActions.INVOKE_METHOD.key]: InvokeMethodProvider,
    [RestBindings.SequenceActions.REJECT.key]: RejectProvider,
    [RestBindings.BIND_ELEMENT.key]: BindElementProvider,
    [RestBindings.GET_FROM_CONTEXT.key]: GetFromContextProvider,
    [RestBindings.SequenceActions.PARSE_PARAMS.key]: ParseParamsProvider,
    [RestBindings.SequenceActions.SEND.key]: SendProvider,
    [RestBindings.AJV_FACTORY.key]: AjvFactoryProvider,
  };
  /**
   * Add built-in body parsers
   */
  bindings = [
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
    app.bind(RestBindings.SEQUENCE).toClass(DefaultSequence);
    const apiSpec = createEmptyApiSpec();
    // Merge the OpenAPI `servers` spec from the config into the empty one
    if (config?.openApiSpec?.servers) {
      Object.assign(apiSpec, {servers: config.openApiSpec.servers});
    }
    app.bind(RestBindings.API_SPEC).to(apiSpec);
  }
}

// TODO(kevin): Extend this interface def to include multiple servers?
export type RestComponentConfig = RestServerConfig;
