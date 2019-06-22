// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository-json-schema
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MetadataAccessor} from '@loopback/metadata';
import {JSONSchema6 as JSONSchema} from 'json-schema';

export const enum MODEL_TYPE_KEYS {
  ModelOnly = 'modelOnly',
  ModelWithRelations = 'modelWithRelations',
}

/**
 * Metadata key used to set or retrieve repository JSON Schema
 */
export const JSON_SCHEMA_KEY = MetadataAccessor.create<
  {[options in MODEL_TYPE_KEYS]: JSONSchema},
  ClassDecorator
>('loopback:json-schema');
