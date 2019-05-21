// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RouteEntry} from './route-entry';
import pathToRegExp = require('path-to-regexp');

/**
 * Sorting order for http verbs
 */
const HTTP_VERBS: {[name: string]: number} = {
  post: 1,
  put: 2,
  patch: 3,
  get: 4,
  head: 5,
  delete: 6,
  options: 7,
};

/**
 * Compare two routes by verb/path for sorting
 * @param route1 - First route entry
 * @param route2 - Second route entry
 */
export function compareRoute(
  route1: Pick<RouteEntry, 'verb' | 'path'>,
  route2: Pick<RouteEntry, 'verb' | 'path'>,
): number {
  // First check the path tokens
  const path1 = route1.path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
  const path2 = route2.path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
  const tokensForPath1: pathToRegExp.Token[] = parse(path1);
  const tokensForPath2: pathToRegExp.Token[] = parse(path2);

  const length =
    tokensForPath1.length > tokensForPath2.length
      ? tokensForPath1.length
      : tokensForPath2.length;

  for (let i = 0; i < length; i++) {
    const token1 = tokensForPath1[i];
    const token2 = tokensForPath2[i];
    if (token1 === token2) continue;
    if (token1 === undefined) return 1;
    if (token2 === undefined) return -1;
    if (token1 < token2) return -1;
    if (token1 > token2) return 1;
  }
  // Then check verb
  const verb1 = HTTP_VERBS[route1.verb.toLowerCase()] || HTTP_VERBS.get;
  const verb2 = HTTP_VERBS[route2.verb.toLowerCase()] || HTTP_VERBS.get;
  if (verb1 !== verb2) return verb1 - verb2;
  return 0;
}

/**
 *
 * @param path - Parse a path template into tokens
 */
function parse(path: string) {
  const tokens: pathToRegExp.Token[] = [];
  pathToRegExp.parse(path).forEach(p => {
    if (typeof p === 'string') {
      // The string can be /orders/count
      tokens.push(...p.split('/').filter(Boolean));
    } else {
      // Use `{}` for wildcard as they are larger than any other ascii chars
      tokens.push(`{}`);
    }
  });
  return tokens;
}
