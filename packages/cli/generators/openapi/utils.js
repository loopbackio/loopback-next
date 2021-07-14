// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const json5 = require('json5');
const url = require('url');

const utils = require('../../lib/utils');
const debug = require('../../lib/debug')('openapi-generator');

/**
 * Convert OpenAPI schema to JSON schema draft 4
 */
const oasToJsonSchema4 = require('@openapi-contrib/openapi-schema-to-json-schema');

/**
 * Convert a string to title case
 * @param {string} str
 */
function titleCase(str) {
  return _.startCase(_.camelCase(str)).replace(/\s/g, '');
}

/**
 * Check if a given key is openapi extension (x-)
 * @param {string} key
 */
function isExtension(key) {
  return typeof key === 'string' && key.startsWith('x-');
}

/**
 * Dump the json object for debugging
 * @param {string} msg Message
 * @param {object} obj The json object
 */
function debugJson(msg, obj) {
  if (debug.enabled) {
    debug('%s: %s', msg, util.inspect(obj, {depth: 10}));
  }
}

/**
 * Validate a url or file path for the open api spec
 * @param {string} specUrlStr
 */
function validateUrlOrFile(specUrlStr) {
  if (!specUrlStr) {
    return 'API spec url or file path is required.';
  }
  const specUrl = url.parse(specUrlStr);
  if (specUrl.protocol === 'http:' || specUrl.protocol === 'https:') {
    return true;
  } else {
    const stat = fs.existsSync(specUrlStr) && fs.statSync(specUrlStr);
    if (stat && stat.isFile()) {
      return true;
    } else {
      return util.format('Path %s is not a file.', specUrlStr);
    }
  }
}

/**
 * JavaScript keywords
 */
const JS_KEYWORDS = [
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
  'enum',
  'implements',
  'interface',
  'let',
  'package',
  'private',
  'protected',
  'public',
  'static',
  'await',
  'abstract',
  'boolean',
  'byte',
  'char',
  'double',
  'final',
  'float',
  'goto',
  'int',
  'long',
  'native',
  'short',
  'synchronized',
  'throws',
  'transient',
  'volatile',
  'null',
  'true',
  'false',
];

/**
 * Avoid tslint error - Shadowed name: 'requestBody'
 */
const DECORATOR_NAMES = ['operation', 'param', 'requestBody'];

const SAFE_IDENTIFER = /^[a-zA-Z_$][0-9a-zA-Z_$]*$/;

/**
 * Escape the name to be a JavaScript identifier. If the name happens to be one
 * of the JavaScript keywords, a `_` prefix will be added. Otherwise, it will
 * be converted using camelCase.
 *
 * For example,
 * - `default` -> `_default`
 * - `my-name` -> 'myName'
 *
 * @param {string} name
 */
function escapeIdentifier(name) {
  if (JS_KEYWORDS.includes(name)) {
    return '_' + name;
  }
  if (!name.match(SAFE_IDENTIFER)) {
    name = _.camelCase(name);
  }
  if (DECORATOR_NAMES.includes(name)) {
    return '_' + name;
  }
  return name;
}

/**
 * Escape the property if it's not a valid JavaScript identifer
 * @param {string} name
 */
function escapePropertyName(name) {
  if (JS_KEYWORDS.includes(name) || !name.match(SAFE_IDENTIFER)) {
    return printSpecObject(name);
  }
  return name;
}

/**
 * Escape a string to be used as a block comment
 *
 * @param {string} comment
 */
function escapeComment(comment) {
  comment = comment || '';
  comment = comment.replace(/\/\*/g, '\\/*').replace(/\*\//g, '*\\/');
  return utils.wrapText(comment, 76);
}

/**
 * Clone an OpenAPI spec. When a `$ref` is encountered, we store it as `x-$ref`
 * and keep the stringified original value as `x-$original-value`. These
 * metadata allows us to access the original object after `$ref` is resolved
 * and dereferenced by the parser.
 *
 * @param {*} spec An OpenAPI spec object
 */
function cloneSpecObject(spec) {
  return _.cloneDeepWith(spec, item => {
    /**
     * A yaml object below produces `null` for `servers.url`
     * ```yaml
     * servers:
     * - url:
     *   description: null url for testing
     * ```
     */
    if (item != null && item.$ref) {
      const copy = _.cloneDeep(item);
      return {
        ...copy,
        // Store the original item in `x-$original`
        'x-$original-value': json5.stringify(item, null, 2),
        // Keep `$ref` as `x-$ref` as `$ref` will be removed during dereferencing
        'x-$ref': item.$ref,
      };
    }
  });
}

/**
 * Print an OpenAPI spec object as JavaScript object literal. The original value
 * is used if `$ref` is resolved.
 * @param {*} specObject - An OpenAPI spec object such as `Parameter` or `Operation`.
 */
function printSpecObject(specObject) {
  return json5.stringify(
    specObject,
    (key, value) => {
      // Restore the original value from `x-$original-value`
      if (value != null && value['x-$ref']) {
        return json5.parse(value['x-$original-value']);
      }
      return value;
    },
    2,
  );
}

/**
 * Restore the OpenAPI spec object to its original value
 * @param {object} specObject - OpenAPI spec object
 */
function restoreSpecObject(specObject) {
  return _.cloneDeepWith(specObject, value => {
    // Restore the original value from `x-$original-value`
    if (value != null && value['x-$ref']) {
      return json5.parse(value['x-$original-value']);
    }
    // Return `undefined` so that child items are cloned too
    return undefined;
  });
}

/**
 * Convert OpenAPI schema to JSON Schema Draft 7
 * @param {object} oasSchema - OpenAPI schema
 */
function toJsonSchema(oasSchema) {
  oasSchema = restoreSpecObject(oasSchema);
  let jsonSchema = oasToJsonSchema4(oasSchema);
  delete jsonSchema['$schema'];
  // See https://json-schema.org/draft-06/json-schema-release-notes.html
  if (jsonSchema.id) {
    // id => $id
    jsonSchema.$id = jsonSchema.id;
    delete jsonSchema.id;
  }
  jsonSchema = _.cloneDeepWith(jsonSchema, value => {
    if (value == null) return value;
    let changed = false;
    if (typeof value.exclusiveMinimum === 'boolean') {
      // exclusiveMinimum + minimum (boolean + number) => exclusiveMinimum (number)
      if (value.exclusiveMinimum) {
        value.exclusiveMinimum = value.minimum;
        delete value.minimum;
      } else {
        delete value.exclusiveMinimum;
      }
      changed = true;
    }
    if (typeof value.exclusiveMaximum === 'boolean') {
      // exclusiveMaximum + maximum (boolean + number) => exclusiveMaximum (number)
      if (value.exclusiveMaximum) {
        value.exclusiveMaximum = value.maximum;
        delete value.maximum;
      } else {
        delete value.exclusiveMaximum;
      }
      changed = true;
    }
    return changed ? value : undefined;
  });
  return jsonSchema;
}

/**
 * Convert OpenAPI schema to JSON schema draft 7 and print it as a JavaScript
 * object literal
 * @param {object} oasSchema - OpenAPI schema
 */
function printJsonSchema(oasSchema) {
  const jsonSchema = toJsonSchema(oasSchema);
  return printSpecObject(jsonSchema);
}

module.exports = {
  isExtension,
  titleCase,
  debug,
  debugJson,
  toFileName: utils.toFileName,
  camelCase: utils.camelCase,
  escapeIdentifier,
  escapePropertyName,
  escapeComment,
  printSpecObject,
  cloneSpecObject,
  toJsonSchema,
  printJsonSchema,
  validateUrlOrFile,
};
