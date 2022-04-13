// Copyright IBM Corp. and LoopBack contributors 2017,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * A common set of interfaces for interacting with databases.
 *
 * This module provides data access facilities to various databases and services
 * as well as the constructs for modeling and accessing those data.
 *
 * @packageDocumentation
 */

export * from '@loopback/filter';
export {JSONSchema7 as JsonSchema} from 'json-schema';
/**
 * Export the DataSource to avoid TypeScript 4.2's complaint about
 * RepositoryMixin as it references `juggler.DataSource`
 */
export {DataSource as JugglerDataSource} from 'loopback-datasource-juggler';
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
export * from './relations';
export * from './repositories';
export * from './transaction';
export * from './type-resolver';
export * from './types';
