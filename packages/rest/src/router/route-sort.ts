import {RouteEntry} from './routing-table';
import pathToRegExp = require('path-to-regexp');

// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

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
 * @param route1 First route entry
 * @param route2 Second route entry
 */
export function compareRoute(
  route1: Pick<RouteEntry, 'verb' | 'path'>,
  route2: Pick<RouteEntry, 'verb' | 'path'>,
): number {
  // First check verb
  const verb1 = HTTP_VERBS[route1.verb.toLowerCase()] || HTTP_VERBS.get;
  const verb2 = HTTP_VERBS[route2.verb.toLowerCase()] || HTTP_VERBS.get;
  if (verb1 !== verb2) return verb1 - verb2;

  // Then check the path tokens
  const path1 = route1.path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
  const path2 = route2.path.replace(/{([^}]*)}(\/|$)/g, ':$1$2');
  const tokensForPath1: pathToRegExp.Token[] = parse(path1);
  const tokensForPath2: pathToRegExp.Token[] = parse(path2);

  // Longer path comes before shorter path
  if (tokensForPath1.length < tokensForPath2.length) {
    return 1;
  } else if (tokensForPath1.length > tokensForPath2.length) {
    return -1;
  }

  // Now check token by token
  for (let i = 0; i < tokensForPath1.length; i++) {
    const token1 = tokensForPath1[i];
    const token2 = tokensForPath2[i];
    if (typeof token1 === 'string' && typeof token2 === 'string') {
      if (token1 < token2) return -1;
      else if (token1 > token2) return 1;
    } else if (typeof token1 === 'string' && typeof token2 === 'object') {
      // token 1 is a literal while token 2 is a parameter
      return -1;
    } else if (typeof token1 === 'object' && typeof token2 === 'string') {
      // token 1 is a parameter while token 2 is a literal
      return 1;
    } else {
      // Both token are parameters. Treat as equal weight.
    }
  }
  return 0;
}

/**
 *
 * @param path Parse a path template into tokens
 */
function parse(path: string) {
  const tokens: pathToRegExp.Token[] = [];
  pathToRegExp.parse(path).forEach(p => {
    if (typeof p === 'string') {
      // The string can be /orders/count
      tokens.push(...p.split('/').filter(Boolean));
    } else {
      tokens.push(p);
    }
  });
  return tokens;
}
