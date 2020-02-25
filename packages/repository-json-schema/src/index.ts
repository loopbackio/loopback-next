// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Convert a TypeScript class/model to a JSON Schema for users, leveraging
 * LoopBack4's decorators, metadata, and reflection system.
 *
 * @remarks
 * Modules to easily convert LoopBack4 models that have been decorated with
 * `@model` and `@property` to a matching JSON Schema Definition.
 *
 * @packageDocumentation
 */

export {Model} from '@loopback/repository';
export * from './build-schema';
export * from './filter-json-schema';
export * from './keys';
export {JsonSchema};

import {JSONSchema6 as JsonSchema} from 'json-schema';
