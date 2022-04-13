// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * The REST API package for loopback-next.
 *
 * @remarks
 * A REST server for LoopBack 4 application instances, complete with:
 *
 * - new custom routing engine (special thanks to @bajtos)!
 * - tools for defining your application routes
 * - OpenAPI 3.0 spec (openapi.json/openapi.yaml) generation using
 *   @loopback/openapi-v3
 * - a default sequence implementation to manage the request and response
 *   lifecycle
 *
 *
 * @packageDocumentation
 */

export * from '@loopback/openapi-v3';
export {
  ErrorHandlerOptions,
  ErrorWriterOptions,
  StrongErrorHandler,
  writeErrorToResponse,
} from 'strong-error-handler';
export * from './body-parsers';
export * from './http-handler';
export * from './keys';
export * from './parse-json';
export * from './parser';
export * from './providers';
export * from './request-context';
export * from './rest-http-error';
export * from './rest.application';
export * from './rest.component';
export * from './rest.server';
export * from './router';
export * from './sequence';
export * from './spec-enhancers/info.spec-enhancer';
export * from './types';
export * from './validation/request-body.validator';
export * from './writer';
export {HttpErrors};

// export all errors from external http-errors package
import HttpErrors from 'http-errors';
