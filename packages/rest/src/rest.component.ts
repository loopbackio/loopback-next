// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding, BindingScope, inject} from '@loopback/context';
import {
  Application,
  Component,
  CoreBindings,
  ProviderMap,
} from '@loopback/core';
import {createEmptyApiSpec} from '@loopback/openapi-v3-types';
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

export class RestComponent implements Component {
  providers: ProviderMap = {
    [RestBindings.SequenceActions.LOG_ERROR.key]: LogErrorProvider,
    [RestBindings.SequenceActions.FIND_ROUTE.key]: FindRouteProvider,
    [RestBindings.SequenceActions.INVOKE_METHOD.key]: InvokeMethodProvider,
    [RestBindings.SequenceActions.REJECT.key]: RejectProvider,
    [RestBindings.BIND_ELEMENT.key]: BindElementProvider,
    [RestBindings.GET_FROM_CONTEXT.key]: GetFromContextProvider,
    [RestBindings.SequenceActions.PARSE_PARAMS.key]: ParseParamsProvider,
    [RestBindings.SequenceActions.SEND.key]: SendProvider,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(RestBindings.CONFIG) config?: RestComponentConfig,
  ) {
    app.bind(RestBindings.SEQUENCE).toClass(DefaultSequence);
    const apiSpec = createEmptyApiSpec();
    // Merge the OpenAPI `servers` spec from the config into the empty one
    if (config && config.openApiSpec && config.openApiSpec.servers) {
      Object.assign(apiSpec, {servers: config.openApiSpec.servers});
    }
    app.bind(RestBindings.API_SPEC).to(apiSpec);
    app.server(RestServer);
    this.bindBodyParsers(app);
  }

  /**
   * Bind body parsers to the `RestServer`. This is needed because
   * we bind `RequestBodyParser` as a singleton so that all body parser bindings
   * need to be added to the same context.
   *
   * @param app Application instance
   */
  private bindBodyParsers(app: Application) {
    const server = app.getSync<RestServer>(
      `${CoreBindings.SERVERS}.RestServer`,
    );

    /**
     * Add built-in body parsers
     */
    const bindings = [
      Binding.bind(RestBindings.REQUEST_BODY_PARSER)
        .toClass(RequestBodyParser)
        .inScope(BindingScope.SINGLETON),
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
    ];
    for (const binding of bindings) {
      server.add(binding);
    }
  }
}

// TODO(kevin): Extend this interface def to include multiple servers?
export type RestComponentConfig = RestServerConfig;
