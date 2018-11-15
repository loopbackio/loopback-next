// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EventEmitter} from 'events';
const pEvent = require('p-event');

/**
 * Options to create an async event iterator
 */
export type AsyncEventIteratorOptions = {
  timeout?: number;
  rejectionEvents?: string[];
  resolutionEvents?: string[];
  multiArgs?: boolean;
  filter?: (event: unknown) => boolean;
};

export function createAsyncEventIterator<T>(
  eventEmitter: EventEmitter,
  eventName: string,
  options?: AsyncEventIteratorOptions,
): AsyncIterableIterator<T> {
  return pEvent.iterator(eventEmitter, eventName, options);
}
