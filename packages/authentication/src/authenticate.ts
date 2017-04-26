// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as assert from 'assert';
import 'reflect-metadata';

export function authenticate(controllerClass: Object, methodName: string) {
  Reflect.defineMetadata('loopback:authenticate', true, controllerClass, methodName);
}

export function getAuthenticateMetadata(controllerObj: Object, methodName: string): boolean {
  return Reflect.getMetadata('loopback:authenticate', controllerObj, methodName) || 'undefined';
}
