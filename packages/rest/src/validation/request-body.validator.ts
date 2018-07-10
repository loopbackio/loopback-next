// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  RequestBodyObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import * as AJV from 'ajv';
import * as debugModule from 'debug';
import * as util from 'util';
import {HttpErrors} from '..';
import {RestHttpErrors} from '..';
import * as _ from 'lodash';

const toJsonSchema = require('openapi-schema-to-json-schema');
const debug = debugModule('loopback:rest:validation');

/**
 * Check whether the request body is valid according to the provided OpenAPI schema.
 * The JSON schema is generated from the OpenAPI schema which is typically defined
 * by `@requestBody()`.
 * The validation leverages AJS shema validator.
 * @param body The body data from an HTTP request.
 * @param requestBodySpec The OpenAPI requestBody specification defined in `@requestBody()`.
 * @param globalSchemas The referenced schemas generated from `OpenAPISpec.components.schemas`.
 */
export function validateRequestBody(
  // tslint:disable-next-line:no-any
  body: any,
  requestBodySpec: RequestBodyObject | undefined,
  globalSchemas?: SchemasObject,
) {
  if (requestBodySpec && requestBodySpec.required && body == undefined)
    throw new HttpErrors.BadRequest('Request body is required');

  const schema = getRequestBodySchema(requestBodySpec);
  debug('Request body schema: %j', util.inspect(schema, {depth: null}));
  if (!schema) return;

  const jsonSchema = convertToJsonSchema(schema);
  validateValueAgainstJsonSchema(body, jsonSchema, globalSchemas);
}

/**
 * Get the schema from requestBody specification.
 * @param requestBodySpec The requestBody specification defined in `@requestBody()`.
 */
function getRequestBodySchema(
  requestBodySpec: RequestBodyObject | undefined,
): SchemaObject | undefined {
  if (!requestBodySpec) return;

  const content = requestBodySpec.content;
  // FIXME(bajtos) we need to find the entry matching the content-type
  // header from the incoming request (e.g. "application/json").
  return content[Object.keys(content)[0]].schema;
}

/**
 * Convert an OpenAPI schema to the corresponding JSON schema.
 * @param openapiSchema The OpenAPI schema to convert.
 */
function convertToJsonSchema(openapiSchema: SchemaObject) {
  const jsonSchema = toJsonSchema(openapiSchema);
  delete jsonSchema['$schema'];
  debug(
    'Converted OpenAPI schema to JSON schema: %s',
    util.inspect(jsonSchema, {depth: null}),
  );
  return jsonSchema;
}

/**
 * Validate the request body data against JSON schema.
 * @param body The request body data.
 * @param schema The JSON schema used to perform the validation.
 * @param globalSchemas Schema references.
 */
function validateValueAgainstJsonSchema(
  // tslint:disable-next-line:no-any
  body: any,
  jsonSchema: object,
  globalSchemas?: SchemasObject,
) {
  const schemaWithRef = Object.assign({components: {}}, jsonSchema);
  schemaWithRef.components = {
    schemas: globalSchemas,
  };

  const ajv = new AJV({
    allErrors: true,
  });
  try {
    if (ajv.validate(schemaWithRef, body)) {
      debug('Request body passed AJV validation.');
      return;
    }
  } catch (err) {
    debug('Cannot execute AJV validation: %s', util.inspect(err));
  }

  debug('Invalid request body: %s', util.inspect(ajv.errors));

  const error = RestHttpErrors.invalidRequestBody();
  error.details = _.map(ajv.errors, e => {
    return {
      path: e.dataPath,
      code: e.keyword,
      message: e.message,
      info: e.params,
    };
  });
  throw error;
}
