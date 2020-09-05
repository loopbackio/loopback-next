// Copyright IBM Corp. 2018,2020. All Rights Reserved.
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
import util from 'util';
import {HttpErrors, RequestBody, RestHttpErrors} from '..';
import {
  SchemaValidatorCache,
  ValidationOptions,
  ValueValidationOptions,
} from '../types';
import {
  AjvFactoryProvider,
  DEFAULT_AJV_VALIDATION_OPTIONS,
} from './ajv-factory.provider';

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
  options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
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
  await validateValueAgainstSchema(body.value, schema, globalSchemas, {
    ...options,
    source: 'body',
  });
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
function getKeyForOptions(
  options: ValidationOptions = DEFAULT_AJV_VALIDATION_OPTIONS,
) {
  const ajvOptions: Record<string, unknown> = {};
  // Sort keys for options
  const keys = Object.keys(options).sort() as (keyof ValidationOptions)[];
  for (const k of keys) {
    if (k === 'compiledSchemaCache') continue;
    ajvOptions[k] = options[k];
  }
  return JSON.stringify(ajvOptions);
}

/**
 * Validate the value against JSON schema.
 * @param value - The data value.
 * @param schema - The JSON schema used to perform the validation.
 * @param globalSchemas - Schema references.
 * @param options - Value validation options.
 */
export async function validateValueAgainstSchema(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  schema: SchemaObject | ReferenceObject,
  globalSchemas: SchemasObject = {},
  options: ValueValidationOptions = {},
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
    const validationResult = await validate(value);
    debug(
      `Value from ${options.source} passed AJV validation.`,
      validationResult,
    );
    return validationResult;
  } catch (error) {
    validationErrors = error.errors;
  }

  /* istanbul ignore if */
  if (debug.enabled) {
    debug(
      'Invalid value: %s. Errors: %s',
      util.inspect(value, {depth: null}),
      util.inspect(validationErrors),
    );
  }

  if (typeof options.ajvErrorTransformer === 'function') {
    validationErrors = options.ajvErrorTransformer(validationErrors);
  }

  // Throw invalid request body error
  if (options.source === 'body') {
    const error = RestHttpErrors.invalidRequestBody(
      buildErrorDetails(validationErrors),
    );
    throw error;
  }

  // Throw invalid value error
  const error = RestHttpErrors.invalidData(value, options.name ?? '(unknown)', {
    details: buildErrorDetails(validationErrors),
  });
  throw error;
}

function buildErrorDetails(
  validationErrors: ajv.ErrorObject[],
): RestHttpErrors.ValidationErrorDetails[] {
  return validationErrors.map(
    (e: ajv.ErrorObject): RestHttpErrors.ValidationErrorDetails => {
      return {
        path: e.dataPath,
        code: e.keyword,
        message: e.message ?? `must pass validation rule ${e.keyword}`,
        info: e.params,
      };
    },
  );
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
