// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * REST API controller implementing default CRUD semantics.
 *
 * @remarks
 * Allows LoopBack 4 applications to quickly expose models via REST API without
 * having to implement custom controller or repository classes.
 *
 * @packageDocumentation
 */

// Re-export `defineCrudRepositoryClass` for backward-compatibility
export {defineCrudRepositoryClass} from '@loopback/repository';
export * from './crud-rest.api-builder';
export * from './crud-rest.component';
export * from './crud-rest.controller';
