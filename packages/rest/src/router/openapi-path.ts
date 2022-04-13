// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {parse} from 'path-to-regexp';

/**
 * OpenAPI spec 3.x does not specify the valid forms of path templates.
 *
 * Other ones such as [URI Template](https://tools.ietf.org/html/rfc6570#section-2.3)
 * or [path-to-regexp](https://github.com/pillarjs/path-to-regexp#named-parameters)
 * allows `[A-Za-z0-9_]`
 */
const POSSIBLE_VARNAME_PATTERN = /\{([^\}]+)\}/g;
const VALID_VARNAME_PATTERN = /^[A-Za-z0-9_]+$/;

/**
 * Validate the path to be compatible with OpenAPI path template. No parameter
 * modifier, custom pattern, or unnamed parameter is allowed.
 */
export function validateApiPath(path = '/') {
  const tokens = parse(path);
  for (const token of tokens) {
    if (typeof token === 'string') continue;
    if (typeof token === 'object') {
      const name = token.name;
      if (typeof name === 'string' && name !== '') {
        throw new Error(
          `Invalid path template: '${path}'. Please use {${name}} instead of ':${name}'`,
        );
      }
      if (typeof name === 'number') {
        throw new Error(`Unnamed parameter is not allowed in path '${path}'`);
      }
      const valid = token.prefix.match(VALID_VARNAME_PATTERN);
      if (!valid) {
        throw new Error(
          `Invalid parameter name '${token.prefix}' found in path '${path}'`,
        );
      }
      if (['?', '+', '*'].includes(token.modifier)) {
        throw new Error(
          `Parameter modifier '{${token.prefix}}${token.modifier}' is not allowed in path '${path}`,
        );
      }
    }
  }
  return path;
}

/**
 * Get all path variables. For example, `/root/{foo}/bar` => `['foo']`
 */
export function getPathVariables(path: string) {
  return path.match(POSSIBLE_VARNAME_PATTERN);
}

/**
 * Convert an OpenAPI path to Express (path-to-regexp) style
 * @param path - OpenAPI path with optional variables as `{var}`
 */
export function toExpressPath(path: string) {
  // Convert `.` to `\\.` so that path-to-regexp will treat it as the plain
  // `.` character
  return path.replace(POSSIBLE_VARNAME_PATTERN, '{:$1}').replace('.', '\\.');
}
