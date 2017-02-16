// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import "reflect-metadata";

const VERSION = require('../package.json').version;

export function controller(baseUrl?: string) {
  return function(constructor: Function) {
    Reflect.defineMetadata('loopback:remoting', {baseUrl, version: VERSION}, constructor);
  };
}

export function get(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  assert(typeof target !== 'function', '@get decorator can be used on prototype methods only');

  const meta = {
    http: { verb: 'get' },
  };

  Reflect.defineMetadata('loopback:remoting', meta, target, propertyKey);
}

export function inspectStringwise(target: Function) {
  const meta = Object.assign({}, Reflect.getMetadata('loopback:remoting', target));
  if (!meta.baseUrl)
    meta.baseUrl = '/' + (target as any).name.replace(/Controller$/, '').toLowerCase() + 's';
  if (!meta.methods) meta.methods = {};

  Object.keys(target.prototype).forEach(k => {
    if (typeof target.prototype[k] !== 'function') return;
    let methodMeta = Reflect.getMetadata('loopback:remoting', target.prototype, k);
    if (!methodMeta) return;
    methodMeta = Object.assign({}, methodMeta);
    const returns = Reflect.getMetadata('design:returntype', target.prototype, k);
    if (returns)
      methodMeta.returns = { type: returns.name || returns };
    meta.methods[k] = methodMeta;
  });
  return meta;
}
