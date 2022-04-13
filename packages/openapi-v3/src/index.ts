// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/openapi-v3
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Decorators that describe LoopBack artifacts as OpenAPI 3.0.0 metadata and
 * utilities that transfer LoopBack metadata to OpenAPI 3.0.0 specifications.
 *
 * @remarks
 * The package has functions described above for LoopBack controller classes.
 * Decorators apply REST api mapping metadata to controller classes and their
 * members. And utilities that inspect controller classes to build OpenAPI 3.0.0
 * specifications from REST API mapping metadata.
 *
 * Functions for more artifacts will be added when needed.
 *
 * @packageDocumentation
 */

export * from '@loopback/repository-json-schema';
export * from './controller-spec';
export * from './decorators';
export * from './enhancers';
export * from './filter-schema';
export * from './json-to-schema';
export * from './types';
