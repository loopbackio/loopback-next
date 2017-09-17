// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ApplicationConfig,
  Component,
  CoreBindings,
  ProviderMap,
  Server,
  Application,
} from '@loopback/core';
import {
  BoundValue,
  Context,
  Injection,
  ValueOrPromise,
  inject,
  Constructor,
} from '@loopback/context';
import {RestBindings} from './keys';
import {LogErrorProvider} from './providers';
import {
  BindElementProvider,
  FindRouteProvider,
  GetFromContextProvider,
  InvokeMethodProvider,
  RejectProvider,
  ParseParamsProvider,
  SendProvider,
} from './providers';
import {RestServer, RestServerConfig} from './rest-server';

export class RestComponent implements Component {
  providers: ProviderMap = {
    [RestBindings.SequenceActions.LOG_ERROR]: LogErrorProvider,
    [RestBindings.SequenceActions.FIND_ROUTE]: FindRouteProvider,
    [RestBindings.SequenceActions.INVOKE_METHOD]: InvokeMethodProvider,
    [RestBindings.SequenceActions.REJECT]: RejectProvider,
    [RestBindings.BIND_ELEMENT]: BindElementProvider,
    [RestBindings.GET_FROM_CONTEXT]: GetFromContextProvider,
    [RestBindings.SequenceActions.PARSE_PARAMS]: ParseParamsProvider,
    [RestBindings.SequenceActions.SEND]: SendProvider,
  };
  servers: Constructor<Server>[] = [];
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(CoreBindings.APPLICATION_CONFIG, undefined, getRestConfig)
    config?: RestComponentConfig,
  ) {
    if (!config) config = {};
    app.bind(RestBindings.CONFIG).to(config);
    this.servers.push(RestServer);
  }
}

function getRestConfig(
  ctx: Context,
  injection: Injection,
): ValueOrPromise<BoundValue> {
  // FIXME(kevin): This is a workaround for the hash (#) keyed property
  // resolving not working!
  const conf = ctx.getSync(injection.bindingKey) as ApplicationConfig;
  return conf.rest || {};
}

export interface RestComponentConfig extends RestServerConfig {
  // TODO(kevin): Extend this interface def to include multiple servers?
}
