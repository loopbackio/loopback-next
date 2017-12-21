// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CoreBindings} from '@loopback/core';

export namespace RestBindings {
  // RestServer-specific bindings
  export const CONFIG = `${CoreBindings.APPLICATION_CONFIG}#rest`;
  export const HOST = 'rest.host';
  export const PORT = 'rest.port';
  export const HANDLER = 'rest.handler';
  export const DIR = 'rest.dir';

  export const API_SPEC = 'rest.apiSpec';
  export const SEQUENCE = 'rest.sequence';

  export namespace SequenceActions {
    export const FIND_ROUTE = 'rest.sequence.actions.findRoute';
    export const PARSE_PARAMS = 'rest.sequence.actions.parseParams';
    export const INVOKE_METHOD = 'rest.sequence.actions.invokeMethod';
    export const LOG_ERROR = 'rest.sequence.actions.logError';
    export const SEND = 'rest.sequence.actions.send';
    export const REJECT = 'rest.sequence.actions.reject';
  }

  export const GET_FROM_CONTEXT = 'getFromContext';
  export const BIND_ELEMENT = 'bindElement';

  // request-specific bindings

  export namespace Http {
    export const REQUEST = 'rest.http.request';
    export const RESPONSE = 'rest.http.response';
    export const CONTEXT = 'rest.http.request.context';
  }
}
