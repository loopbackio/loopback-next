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
  options?: AJV.Options,
) {
  if (!requestBodySpec) return;

  if (requestBodySpec.required && body == undefined) {
    const err = Object.assign(
      new HttpErrors.BadRequest('Request body is required'),
      {
        code: 'MISSING_REQUIRED_PARAMETER',
        parameterName: 'request body',
      },
    );
    throw err;
  }

  const schema = getRequestBodySchema(requestBodySpec);
  debug('Request body schema: %j', util.inspect(schema, {depth: null}));
  if (!schema) return;

  validateValueAgainstSchema(body, schema, globalSchemas, options);
}

/**
 * Get the schema from requestBody specification.
 * @param requestBodySpec The requestBody specification defined in `@requestBody()`.
 */
function getRequestBodySchema(
  requestBodySpec: RequestBodyObject,
): SchemaObject | undefined {
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

const compiledSchemaCache = new WeakMap();

function validateValueAgainstSchema(
  // tslint:disable-next-line:no-any
  body: any,
  schema: SchemaObject,
  globalSchemas?: SchemasObject,
  options?: AJV.Options,
) {
  let validate;

  if (compiledSchemaCache.has(schema)) {
    validate = compiledSchemaCache.get(schema);
  } else {
    validate = createValidator(schema, globalSchemas, options);
    compiledSchemaCache.set(schema, validate);
  }

  if (validate(body)) {
    debug('Request body passed AJV validation.');
    return;
  }

  const validationErrors = validate.errors;

  debug('Invalid request body: %s', util.inspect(validationErrors));

  const error = RestHttpErrors.invalidRequestBody();
  error.details = _.map(validationErrors, e => {
    return {
      path: e.dataPath,
      code: e.keyword,
      message: e.message,
      info: e.params,
    };
  });
  throw error;
}

function createValidator(
  schema: SchemaObject,
  globalSchemas?: SchemasObject,
  options?: AJV.Options,
): Function {
  const jsonSchema = convertToJsonSchema(schema);

  const schemaWithRef = Object.assign({components: {}}, jsonSchema);
  schemaWithRef.components = {
    schemas: globalSchemas,
  };

  const ajv = new AJV(
    Object.assign(
      {},
      {
        allErrors: true,
      },
      options,
    ),
  );

  return ajv.compile(schemaWithRef);
}
