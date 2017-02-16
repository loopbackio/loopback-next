// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';

const VERSION = require('../package.json').version;

export function controller(baseUrl: string) {
  return function(constructor: Function) {
    const meta = constructor as any;
    if (!meta._loopbackRemoting)
      meta._loopbackRemoting = constructor.prototype._loopbackRemoting || {};

    meta._loopbackRemoting.baseUrl = baseUrl;
    meta._loopbackRemoting.version = VERSION;
  };
}

export function get(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  assert(typeof target !== 'function', '@get decorator can be used on prototype methods only');

  if (!target._loopbackRemoting)
    target._loopbackRemoting = {};

  target._loopbackRemoting[propertyKey] = {
    http: { verb: 'get' },
  };
}

export function inspectStringwise(target: Function) {
  return (target as any)._loopbackRemoting || {};
}
