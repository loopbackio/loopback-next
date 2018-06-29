// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RequestBodyObject,
  SchemaObject,
  SchemasObject,
  isReferenceObject,
} from '@loopback/openapi-v3-types';
import * as AJV from 'ajv';
import * as debugModule from 'debug';
import * as util from 'util';
import {HttpErrors} from '..';
import {RestHttpErrors} from '../coercion/rest-http-error';

const toJsonSchema = require('openapi-schema-to-json-schema');

const debug = debugModule('loopback:rest:validation');

export function validateRequestBody(
  // tslint:disable-next-line:no-any
  body: any,
  requestBodySpec: RequestBodyObject | undefined,
  globalSchemas?: SchemasObject,
) {
  if (requestBodySpec && requestBodySpec.required && body == undefined)
    throw new HttpErrors.BadRequest('Request body is required');

  const schema = getRequestBodySchema(requestBodySpec, globalSchemas || {});
  debug('Request body schema: %j', util.inspect(schema, {depth: null}));
  if (!schema) return;

  const jsonSchema = convertToJsonSchema(schema);
  validateValueAgainstJsonSchema(body, jsonSchema);
}

function getRequestBodySchema(
  requestBodySpec: RequestBodyObject | undefined,
  globalSchemas: SchemasObject,
): SchemaObject | undefined {
  if (!requestBodySpec) return;

  const content = requestBodySpec.content;
  // FIXME(bajtos) we need to find the entry matching the content-type
  // header from the incoming request (e.g. "application/json").
  const schema = content[Object.keys(content)[0]].schema;
  if (!schema || !isReferenceObject(schema)) {
    return schema;
  }

  return resolveSchemaReference(schema.$ref, globalSchemas);
}

function resolveSchemaReference(ref: string, schemas: SchemasObject) {
  // A temporary solution for resolving schema references produced
  // by @loopback/repository-json-schema. In the future, we should
  // support arbitrary references anywhere in the OpenAPI spec.
  // See https://github.com/strongloop/loopback-next/issues/435
  const match = ref.match(/^#\/components\/schemas\/([^\/]+)$/);
  if (!match) throw new Error(`Unsupported schema reference format: ${ref}`);
  const schemaId = match[1];

  debug(`Resolving schema reference ${ref} (schema id ${schemaId}).`);
  if (!(schemaId in schemas)) {
    throw new Error(`Invalid reference ${ref} - schema ${schemaId} not found.`);
  }
  return schemas[schemaId];
}

function convertToJsonSchema(openapiSchema: SchemaObject) {
  const jsonSchema = toJsonSchema(openapiSchema);
  delete jsonSchema['$schema'];
  debug(
    'Converted OpenAPI schema to JSON schema: %s',
    util.inspect(jsonSchema, {depth: null}),
  );
  return jsonSchema;
}

// tslint:disable-next-line:no-any
function validateValueAgainstJsonSchema(body: any, schema: any) {
  const ajv = new AJV({allErrors: true});
  try {
    if (ajv.validate(schema, body)) {
      debug('Request body passed AJV validation.');
      return;
    }
  } catch (err) {
    debug('Cannot execute AJV validation: %s', util.inspect(err));
  }

  debug('Invalid request body: %s', util.inspect(ajv.errors));
  const message = ajv.errorsText(ajv.errors, {dataVar: body});
  // FIXME add `err.details` object containing machine-readable information
  // see LB 3.x ValidationError for inspiration
  throw RestHttpErrors.invalidRequestBody(message);
}
