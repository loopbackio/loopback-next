// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/rest-crud
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Reexport `defineEntityCrudRepositoryClass` from `@loopback/repository` as
// `defineCrudRepositoryClass` for backward-compatibility
export {defineEntityCrudRepositoryClass as defineCrudRepositoryClass} from '@loopback/repository';
export * from './crud-rest.api-builder';
export * from './crud-rest.component';
export * from './crud-rest.controller';
