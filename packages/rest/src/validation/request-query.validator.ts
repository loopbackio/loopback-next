import {
  RequestBodyObject,
  SchemaObject,
  ReferenceObject,
  SchemasObject,
} from '@loopback/openapi-v3-types';
import * as AJV from 'ajv';
import * as debugModule from 'debug';
import * as util from 'util';
import {HttpErrors, RestHttpErrors, ValueWithSchema} from '..';
import * as _ from 'lodash';

const toJsonSchema = require('openapi-schema-to-json-schema');
const debug = debugModule('loopback:rest:validation');

export type RequestQueryValidationOptions = AJV.Options;

/**
 * Check whether the request query is valid according to the provided OpenAPI schema.
 * The JSON schema is generated from the OpenAPI schema which is typically defined
 * by `@requestQuery()`.
 * The validation leverages AJS schema validator.
 * @param query The request query parsed from an HTTP request.
 * @param requestQuerySpec The OpenAPI requestQuery specification defined in `@requestQuery()`.
 * @param globalSchemas The referenced schemas generated from `OpenAPISpec.components.schemas`.
 */
export function validateRequestQuery(
  query: ValueWithSchema,
  requestQuerySpec?: RequestBodyObject,
  globalSchemas: SchemasObject = {},
  options: RequestQueryValidationOptions = {},
) {
  const required = requestQuerySpec && requestQuerySpec.required;

  if (required && query.value == undefined) {
    const err = Object.assign(
      new HttpErrors.BadRequest('Request query is required'),
      {
        code: 'MISSING_REQUIRED_PARAMETER',
        parameterName: 'request query',
      },
    );
    throw err;
  }

  const schema = query.schema;
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Request query schema: %j', util.inspect(schema, {depth: null}));
  }
  if (!schema) return;

  options = Object.assign({coerceTypes: query.coercionRequired}, options);
  validateValueAgainstSchema(query.value, schema, globalSchemas, options);
}

/**
 * Convert an OpenAPI schema to the corresponding JSON schema.
 * @param openapiSchema The OpenAPI schema to convert.
 */
function convertToJsonSchema(openapiSchema: SchemaObject) {
  const jsonSchema = toJsonSchema(openapiSchema);
  delete jsonSchema['$schema'];
  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Converted OpenAPI schema to JSON schema: %s',
      util.inspect(jsonSchema, {depth: null}),
    );
  }
  return jsonSchema;
}

/**
 * Validate the request query data against JSON schema.
 * @param query The request query data.
 * @param schema The JSON schema used to perform the validation.
 * @param globalSchemas Schema references.
 */

const compiledSchemaCache = new WeakMap();

export function validateValueAgainstSchema(
  // tslint:disable-next-line:no-any
  query: any,
  schema: SchemaObject | ReferenceObject,
  globalSchemas?: SchemasObject,
  options?: RequestQueryValidationOptions,
) {
  let validate;

  if (compiledSchemaCache.has(schema)) {
    validate = compiledSchemaCache.get(schema);
  } else {
    validate = createValidator(schema, globalSchemas, options);
    compiledSchemaCache.set(schema, validate);
  }

  if (validate(query)) {
    debug('Request query passed AJV validation.');
    return;
  }

  const validationErrors = validate.errors;

  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Invalid request query: %s. Errors: %s',
      util.inspect(query, {depth: null}),
      util.inspect(validationErrors),
    );
  }

  const error = RestHttpErrors.invalidRequestQuery();
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
  options?: RequestQueryValidationOptions,
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
