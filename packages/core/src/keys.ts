// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export namespace CoreBindings {
  // application-wide bindings

  export const HTTP_PORT = 'http.port';
  export const GRPC_PORT = 'grpc.port';
  export const HTTP_HANDLER = 'http.handler';

  export const API_SPEC = 'application.apiSpec';

  export namespace SequenceActions {
    export const FIND_ROUTE = 'sequence.actions.findRoute';
    export const PARSE_PARAMS = 'sequence.actions.parseParams';
    export const INVOKE_METHOD = 'sequence.actions.invokeMethod';
    export const LOG_ERROR = 'sequence.actions.logError';
    export const SEND = 'sequence.actions.send';
    export const REJECT = 'sequence.actions.reject';
  }

  export const GET_FROM_CONTEXT = 'getFromContext';
  export const BIND_ELEMENT = 'bindElement';

  // request-specific bindings

  export const CONTROLLER_NAME = 'controller.current.name';
  export const CONTROLLER_CLASS = 'controller.current.ctor';
  export const CONTROLLER_METHOD_NAME = 'controller.current.operation';
  export const CONTROLLER_METHOD_META = 'controller.method.meta';

  export namespace Http {
    export const SEQUENCE = 'http.sequence';
    export const REQUEST = 'http.request';
    export const RESPONSE = 'http.response';
    export const CONTEXT = 'http.request.context';
  }

  export namespace Grpc {
    export const PORT = 'grpc.port';
    export const CONTEXT = 'grpc.request.context';
    export const SEQUENCE = 'grpc.sequence';
  }
}
