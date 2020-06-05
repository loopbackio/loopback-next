// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/fastify
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import debugFactory from 'debug';
import HttpErrors from 'http-errors';
import qs from 'qs';

const debug = debugFactory('loopback:fastify:query-parser');

// This type is copied from Fastify types, I think they have a bug there
// because they don't allow (nested) objects
export type FastifyParsedQuery = {[key: string]: string | string[]};

export function parseQueryString(str: string): FastifyParsedQuery {
  const parsed = qs.parse(str);
  for (const key in parsed) {
    const value = parsed[key];
    // TODO: Find a way how to obtain operation spec, so that we
    // try to JSON parse only parameters defined with type object (or array)
    if (typeof value !== 'string') continue;
    if (value.length < 2) continue;
    const first = value[0];
    const last = value[value.length - 1];
    const looksLikeJson =
      (first === '{' && last === '}') || (first === '[' && last === ']');
    if (!looksLikeJson) continue;
    try {
      parsed[key] = JSON.parse(value);
      debug('Parsed query parameter %s as %j', key, parsed[key]);
    } catch (err) {
      debug('Cannot parse %s value %j as JSON: %s', key, value, err.message);
      throw createInvalidDataError(value, key, {
        details: {
          syntaxError: err.message,
        },
      });
    }
  }
  return (parsed as unknown) as FastifyParsedQuery;
}

function createInvalidDataError<T, Props extends object = {}>(
  data: T,
  name: string,
  extraProperties?: Props,
): HttpErrors.HttpError & Props {
  const msg = `Invalid data ${JSON.stringify(data)} for parameter ${name}!`;
  return Object.assign(
    new HttpErrors.BadRequest(msg),
    {
      code: 'INVALID_PARAMETER_VALUE',
      parameterName: name,
    },
    extraProperties,
  );
}

// Copied from packages/rest/src/parse-json.ts
// Do we want to share this or perhaps find a 3rd party package implementing
// safe JSON parsing?

/* eslint-disable @typescript-eslint/no-explicit-any */

// These utilities are introduced to mitigate the prototype pollution issue
// with `JSON.parse`.
// See https://hueniverse.com/a-tale-of-prototype-poisoning-2610fa170061
//
// The [bourne](https://github.com/hapijs/bourne) module provides a drop-in
// replacement for `JSON.parse` but we need to instruct `body-parser` to honor
// a `reviver` function.

/**
 * Factory to create a reviver function for `JSON.parse` to sanitize keys
 * @param reviver - Reviver function
 */
export function sanitizeJsonParse(reviver?: (key: any, value: any) => any) {
  return (key: string, value: any) => {
    if (key === '__proto__')
      throw new Error('JSON string cannot contain "__proto__" key.');
    if (reviver) {
      return reviver(key, value);
    } else {
      return value;
    }
  };
}

/**
 *
 * @param text - JSON string
 * @param reviver - Optional reviver function for `JSON.parse`
 */
export function parseJson(
  text: string,
  reviver?: (key: any, value: any) => any,
) {
  return JSON.parse(text, sanitizeJsonParse(reviver));
}
