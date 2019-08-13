// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import pathToRegExp = require('path-to-regexp');

/**
 * OpenAPI spec 3.x does not specify the valid forms of path templates.
 *
 * Other ones such as [URI Template](https://tools.ietf.org/html/rfc6570#section-2.3)
 * or [path-to-regexp](https://github.com/pillarjs/path-to-regexp#named-parameters)
 * allows `[A-Za-z0-9_]`
 */
const POSSIBLE_VARNAME_PATTERN = /\{([^\}]+)\}/g;
const INVALID_VARNAME_PATTERN = /\{([^\}]*[^\w\}][^\}]*)\}/;

/**
 * Validate the path to be compatible with OpenAPI path template. No parameter
 * modifier, custom pattern, or unnamed parameter is allowed.
 */
export function validateApiPath(path = '/') {
  let tokens = pathToRegExp.parse(path);
  if (tokens.some(t => typeof t === 'object')) {
    throw new Error(
      `Invalid path template: '${path}'. Please use {param} instead of ':param'`,
    );
  }

  const invalid = path.match(INVALID_VARNAME_PATTERN);
  if (invalid) {
    throw new Error(
      `Invalid parameter name '${invalid[1]}' found in path '${path}'`,
    );
  }

  const regexpPath = toExpressPath(path);
  tokens = pathToRegExp.parse(regexpPath);
  for (const token of tokens) {
    if (typeof token === 'string') continue;
    if (typeof token.name === 'number') {
      // Such as /(.*)
      throw new Error(`Unnamed parameter is not allowed in path '${path}'`);
    }
    if (
      (token.optional || token.repeat || token.pattern !== '[^\\/]+?') &&
      // Required by path-to-regexp@3.x
      token.prefix === '/'
    ) {
      // Such as /:foo*, /:foo+, /:foo?, or /:foo(\\d+)
      throw new Error(`Parameter modifier is not allowed in path '${path}'`);
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
  return path.replace(POSSIBLE_VARNAME_PATTERN, ':$1').replace('.', '\\.');
}
