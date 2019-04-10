// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
const fs = require('fs');
const util = require('util');
const _ = require('lodash');
const json5 = require('json5');

const utils = require('../../lib/utils');
const debug = require('../../lib/debug')('openapi-generator');

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
    debug('%s: %s', msg, JSON.stringify(obj, null, 2));
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
  var specUrl = url.parse(specUrlStr);
  if (specUrl.protocol === 'http:' || specUrl.protocol === 'https:') {
    return true;
  } else {
    var stat = fs.existsSync(specUrlStr) && fs.statSync(specUrlStr);
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
  return name;
}

function toJsonStr(val) {
  return json5.stringify(val, null, 2);
}

module.exports = {
  isExtension,
  titleCase,
  debug,
  debugJson,
  kebabCase: utils.kebabCase,
  camelCase: _.camelCase,
  escapeIdentifier,
  toJsonStr,
  validateUrlOrFile,
};
