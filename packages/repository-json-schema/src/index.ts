// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export * from './build-schema';
export * from './keys';
export * from './filter-json-schema';

import {JSONSchema6 as JsonSchema} from 'json-schema';
export {JsonSchema};

export {Model} from '@loopback/repository';
