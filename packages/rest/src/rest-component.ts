// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Component,
  CoreBindings,
  ProviderMap,
  Server,
  Application,
} from '@loopback/core';
import {inject, Constructor} from '@loopback/context';
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
  servers: {
    [name: string]: Constructor<Server>;
  } = {
    RestServer,
  };

  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE) app: Application,
    @inject(RestBindings.CONFIG) config?: RestComponentConfig,
  ) {
    if (!config) config = {};
  }
}

export interface RestComponentConfig extends RestServerConfig {
  // TODO(kevin): Extend this interface def to include multiple servers?
}
