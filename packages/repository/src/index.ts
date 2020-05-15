// Copyright IBM Corp. 2017,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A common set of interfaces for interacting with databases.
 *
 * @remarks
 * *NOTE:* This module is experimental and evolving. It is likely going to be
 * refactored and decomposed into multiple modules as we refine the story based
 * on the legacy loopback-datasource-juggler and connector modules from LoopBack
 * 3.x.
 *
 * This module provides data access facilities to various databases and services
 * as well as the constructs for modeling and accessing those data.
 *
 * @packageDocumentation
 */

export {JSONSchema7 as JsonSchema} from 'json-schema';
export * from './common-types';
export * from './connectors';
export * from './datasource';
export * from './decorators';
export * from './define-model-class';
export * from './define-repository-class';
export * from './errors';
export * from './keys';
export * from './mixins';
export * from './model';
export * from './query';
export * from './relations';
export * from './repositories';
export * from './transaction';
export * from './type-resolver';
export * from './types';
