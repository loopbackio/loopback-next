import {SchemaObject, isSchemaObject} from '@loopback/openapi-spec-types';

interface TypeAndFormat {
  type?: string;
  format?: string;
}
/**
 * Generate the `type` and `format` property in a Schema Object according to a
 * parameter's type.
 * `type` and `format` will be preserved if provided in `schema`
 *
 * @param type The JavaScript type of a parameter
 * @param schema The schema object provided in an parameter object
 */
export function getSchemaForParam(
  type: Function,
  schema: SchemaObject,
): SchemaObject {
  // preserve `type` and `format` provided by user
  if (isSchemaObject(schema) && schema.type && schema.format) return schema;

  let typeAndFormat: TypeAndFormat = {};
  if (type === String) {
    typeAndFormat.type = 'string';
  } else if (type === Number) {
    typeAndFormat.type = 'number';
  } else if (type === Boolean) {
    typeAndFormat.type = 'boolean';
  } else if (type === Array) {
    // item type cannot be inspected
    typeAndFormat.type = 'array';
  } else if (type === Object) {
    typeAndFormat.type = 'object';
  }

  if (typeAndFormat.type && !schema.type) schema.type = typeAndFormat.type;
  if (typeAndFormat.format && !schema.format)
    schema.format = typeAndFormat.format;

  return schema;
}

/**
 * Get OpenAPI Schema for a JavaScript type for a body parameter
 * @param type The JavaScript type of an argument deccorated by @requestBody
 */
export function getSchemaForRequestBody(type: Function): SchemaObject {
  let generatedSchema = getSchemaForParam(type, {});
  if (!generatedSchema.type)
    generatedSchema.$ref = '#/components/schemas/' + type.name;
  return generatedSchema;
}
