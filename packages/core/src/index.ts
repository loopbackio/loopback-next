// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// package dependencies
export {Application} from './application';
export {Component, ProviderMap} from './component';
export * from './router/metadata';
export * from './sequence';

// loopback dependencies
export {inject} from '@loopback/context';
export * from '@loopback/openapi-spec';

// external dependencies
export {ServerRequest, ServerResponse} from 'http';

// import all errors from external http-errors package
import * as HttpErrors from 'http-errors';

// http errors
export {HttpErrors};

export * from './grpc/decorators/service.decorator';
export * from './grpc/grpc-types';
import {
  SequenceHandler as GrpcSequenceHandler,
  DefaultSequence as GrpcDefaultSequence,
} from './grpc/sequence';
export {GrpcSequenceHandler, GrpcDefaultSequence};
// NOTE(bajtos) ^^ that's a hack for this spike so that I don't have to start
// a new grpc package yet. This will not make it into `master` branch.

// internals used by unit-tests
export {
  ParsedRequest,
  OperationRetval,
  FindRoute,
  InvokeMethod,
  LogError,
  OperationArgs,
  GetFromContext,
  BindElement,
  PathParameterValues,
  ParseParams,
  Reject,
  Send,
} from './internal-types';
export {parseOperationArgs} from './parser';
export {parseRequestUrl} from './router/routing-table';
export {
  RouteEntry,
  RoutingTable,
  Route,
  ControllerRoute,
  ResolvedRoute,
  createResolvedRoute,
} from './router/routing-table';
export {HttpHandler} from './http-handler';
export {writeResultToResponse} from './writer';
export {RejectProvider} from './router/providers/reject';
export * from './keys';
