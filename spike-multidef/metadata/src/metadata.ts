// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import "reflect-metadata";

const VERSION = require('../package.json').version;
const REMOTING_METADATA_KEY = Symbol('loopback:remoting');

export function controller(baseUrl?: string) {
  return function(constructor: Function) {
    const meta = {
      baseUrl,
      version: VERSION,
    };
    Reflect.defineMetadata('loopback:remoting', meta, constructor);
    Reflect.defineMetadata(REMOTING_METADATA_KEY, meta, constructor);
  };
}

export function get(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  assert(typeof target !== 'function', '@get decorator can be used on prototype methods only');

  const meta = {
    http: { verb: 'get' },
  };

  Reflect.defineMetadata('loopback:remoting', meta, target, propertyKey);
  Reflect.defineMetadata(REMOTING_METADATA_KEY, meta, target, propertyKey);
}

function inspect(target: Function, key: string | symbol) {
  const meta = Object.assign({}, Reflect.getMetadata(key, target));
  if (!meta.baseUrl)
    meta.baseUrl = '/' + (target as any).name.replace(/Controller$/, '').toLowerCase() + 's';
  if (!meta.methods) meta.methods = {};

  Object.keys(target.prototype).forEach(k => {
    if (typeof target.prototype[k] !== 'function') return;
    let methodMeta = Reflect.getMetadata(key, target.prototype, k);
    if (!methodMeta) return;
    methodMeta = Object.assign({}, methodMeta);
    const returns = Reflect.getMetadata('design:returntype', target.prototype, k);
    if (returns)
      methodMeta.returns = { type: returns.name || returns };
    meta.methods[k] = methodMeta;
  });
  return meta;
}

export function inspectStringwise(target: Function) {
  return inspect(target, 'loopback:remoting');
}

export function inspectSymbolwise(target: Function) {
  return inspect(target, REMOTING_METADATA_KEY);
}
