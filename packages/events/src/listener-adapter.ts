// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ListenerFunction} from './types';
import {MetadataInspector} from '@loopback/metadata';

/**
 * Create a listener function for an object that has methods for corresponding
 * events. For example:
 * ```ts
 * export class MyListener {
 *   async start() {}
 *   async stop() {}
 * }
 * ```
 * @param obj
 */
export function asListener<T>(obj: {
  [method: string]: unknown;
}): ListenerFunction<T> {
  return async (event, eventName) => {
    const name = eventName.toString();
    for (const m of findListenMethods(obj, name)) {
      if (m === 'listen') {
        await (obj.listen as Function)(event, eventName);
      } else {
        await (obj[m] as Function)(event, eventName);
      }
    }
  };
}

function findListenMethods(
  obj: {
    [method: string]: unknown;
  },
  eventName: string,
): string[] {
  const listenMethods =
    MetadataInspector.getAllMethodMetadata<(string | RegExp)[]>(
      'events:listen',
      obj,
    ) || {};
  const methods = [];
  for (const m in listenMethods) {
    if (
      listenMethods[m].some(e => {
        return !!eventName.match(e);
      })
    ) {
      methods.push(m);
    }
  }
  if (methods.length === 0) {
    if (typeof obj[eventName] === 'function') {
      methods.push(eventName);
    }
    if (typeof obj['listen'] === 'function') {
      methods.push('listen');
    }
  }
  return methods;
}
