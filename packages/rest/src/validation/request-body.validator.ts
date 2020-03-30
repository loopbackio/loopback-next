// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  isReferenceObject,
  ReferenceObject,
  RequestBodyObject,
  SchemaObject,
  SchemasObject,
} from '@loopback/openapi-v3';
import ajv, {Ajv} from 'ajv';
import debugModule from 'debug';
import _ from 'lodash';
import util from 'util';
import {HttpErrors, RequestBody, RestHttpErrors} from '..';
import {RequestBodyValidationOptions, SchemaValidatorCache} from '../types';
import {AjvFactoryProvider} from './ajv-factory.provider';

const toJsonSchema = require('@openapi-contrib/openapi-schema-to-json-schema');
const debug = debugModule('loopback:rest:validation');

/**
 * Check whether the request body is valid according to the provided OpenAPI schema.
 * The JSON schema is generated from the OpenAPI schema which is typically defined
 * by `@requestBody()`.
 * The validation leverages AJV schema validator.
 * @param body - The request body parsed from an HTTP request.
 * @param requestBodySpec - The OpenAPI requestBody specification defined in `@requestBody()`.
 * @param globalSchemas - The referenced schemas generated from `OpenAPISpec.components.schemas`.
 * @param options - Request body validation options for AJV
 */
export async function validateRequestBody(
  body: RequestBody,
  requestBodySpec?: RequestBodyObject,
  globalSchemas: SchemasObject = {},
  options: RequestBodyValidationOptions = {},
) {
  const required = requestBodySpec?.required;

  if (required && body.value == null) {
    const err = Object.assign(
      new HttpErrors.BadRequest('Request body is required'),
      {
        code: 'MISSING_REQUIRED_PARAMETER',
        parameterName: 'request body',
      },
    );
    throw err;
  }

  const schema = body.schema;
  /* istanbul ignore if */
  if (debug.enabled) {
    debug('Request body schema:', util.inspect(schema, {depth: null}));
    if (
      schema &&
      isReferenceObject(schema) &&
      schema.$ref.startsWith('#/components/schemas/')
    ) {
      const ref = schema.$ref.slice('#/components/schemas/'.length);
      debug('  referencing:', util.inspect(globalSchemas[ref], {depth: null}));
    }
  }
  if (!schema) return;

  options = {coerceTypes: !!body.coercionRequired, ...options};
  await validateValueAgainstSchema(body.value, schema, globalSchemas, options);
}

/**
 * Convert an OpenAPI schema to the corresponding JSON schema.
 * @param openapiSchema - The OpenAPI schema to convert.
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
 * Built-in cache for complied schemas by AJV
 */
const DEFAULT_COMPILED_SCHEMA_CACHE: SchemaValidatorCache = new WeakMap();

/**
 * Build a cache key for AJV options
 * @param options - Request body validation options
 */
function getKeyForOptions(options: RequestBodyValidationOptions) {
  const ajvOptions: Record<string, unknown> = {};
  // Sort keys for options
  const keys = Object.keys(
    options,
  ).sort() as (keyof RequestBodyValidationOptions)[];
  for (const k of keys) {
    if (k === 'compiledSchemaCache') continue;
    ajvOptions[k] = options[k];
  }
  return JSON.stringify(ajvOptions);
}

/**
 * Validate the request body data against JSON schema.
 * @param body - The request body data.
 * @param schema - The JSON schema used to perform the validation.
 * @param globalSchemas - Schema references.
 * @param options - Request body validation options.
 */
async function validateValueAgainstSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
  schema: SchemaObject | ReferenceObject,
  globalSchemas: SchemasObject = {},
  options: RequestBodyValidationOptions = {},
) {
  let validate: ajv.ValidateFunction | undefined;

  const cache = options.compiledSchemaCache ?? DEFAULT_COMPILED_SCHEMA_CACHE;
  const key = getKeyForOptions(options);

  let validatorMap: Map<string, ajv.ValidateFunction> | undefined;
  if (cache.has(schema)) {
    validatorMap = cache.get(schema)!;
    validate = validatorMap.get(key);
  }

  if (!validate) {
    const ajvFactory =
      options.ajvFactory ?? new AjvFactoryProvider(options).value();
    const ajvInst = ajvFactory(options);
    validate = createValidator(schema, globalSchemas, ajvInst);
    validatorMap = validatorMap ?? new Map();
    validatorMap.set(key, validate);
    cache.set(schema, validatorMap);
  }

  let validationErrors: ajv.ErrorObject[] = [];
  try {
    const validationResult = await validate(body);
    // When body is optional & values is empty / null, ajv returns null
    if (validationResult || validationResult === null) {
      debug('Request body passed AJV validation.');
      return;
    }
  } catch (error) {
    validationErrors = error.errors;
  }

  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Invalid request body: %s. Errors: %s',
      util.inspect(body, {depth: null}),
      util.inspect(validationErrors),
    );
  }

  if (typeof options.ajvErrorTransformer === 'function') {
    validationErrors = options.ajvErrorTransformer(validationErrors);
  }

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

/**
 * Create a validate function for the given schema
 * @param schema - JSON schema for the target
 * @param globalSchemas - Global schemas
 * @param ajvInst - An instance of Ajv
 */
function createValidator(
  schema: SchemaObject,
  globalSchemas: SchemasObject = {},
  ajvInst: Ajv,
): ajv.ValidateFunction {
  const jsonSchema = convertToJsonSchema(schema);

  // Clone global schemas to set `$async: true` flag
  const schemas: SchemasObject = {};
  for (const name in globalSchemas) {
    // See https://github.com/strongloop/loopback-next/issues/4939
    schemas[name] = {...globalSchemas[name], $async: true};
  }
  const schemaWithRef = {components: {schemas}, ...jsonSchema};

  // See https://ajv.js.org/#asynchronous-validation for async validation
  schemaWithRef.$async = true;

  return ajvInst.compile(schemaWithRef);
}
