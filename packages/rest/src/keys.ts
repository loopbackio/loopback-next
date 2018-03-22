// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ServerResponse} from 'http';
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
  ParsedRequest,
  ParseParams,
  Reject,
  Send,
} from './internal-types';

// NOTE(bajtos) The following import is required to satisfy TypeScript compiler
// tslint:disable-next-line:no-unused-variable
import {OpenAPIObject} from '@loopback/openapi-v3-types';

export namespace RestBindings {
  // RestServer-specific bindings
  export const CONFIG = CoreBindings.APPLICATION_CONFIG.deepProperty('rest');
  export const HOST = BindingKey.create<string | undefined>('rest.host');
  export const PORT = BindingKey.create<number>('rest.port');
  export const HANDLER = BindingKey.create<HttpHandler>('rest.handler');

  export const API_SPEC = BindingKey.create<OpenApiSpec>('rest.apiSpec');
  export const SEQUENCE = BindingKey.create<SequenceHandler>('rest.sequence');

  export namespace SequenceActions {
    export const FIND_ROUTE = BindingKey.create<FindRoute>(
      'rest.sequence.actions.findRoute',
    );
    export const PARSE_PARAMS = BindingKey.create<ParseParams>(
      'rest.sequence.actions.parseParams',
    );
    export const INVOKE_METHOD = BindingKey.create<InvokeMethod>(
      'rest.sequence.actions.invokeMethod',
    );
    export const LOG_ERROR = BindingKey.create<LogError>(
      'rest.sequence.actions.logError',
    );
    export const SEND = BindingKey.create<Send>('rest.sequence.actions.send');
    export const REJECT = BindingKey.create<Reject>(
      'rest.sequence.actions.reject',
    );
  }

  export const GET_FROM_CONTEXT = BindingKey.create<GetFromContext>(
    'getFromContext',
  );
  export const BIND_ELEMENT = BindingKey.create<BindElement>('bindElement');

  // request-specific bindings

  export namespace Http {
    export const REQUEST = BindingKey.create<ParsedRequest>(
      'rest.http.request',
    );
    export const RESPONSE = BindingKey.create<ServerResponse>(
      'rest.http.response',
    );
    export const CONTEXT = BindingKey.create<Context>(
      'rest.http.request.context',
    );
  }
}
