// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {MethodDecoratorFactory} from '@loopback/metadata';

/**
 * Decorate a method to listen to certain events.
 * For example,
 * ```ts
 * @listen('start')
 * async function onStart() {
 * }
 * ```
 * @param messageTypes
 */
export function listen(...messageTypes: (string | RegExp)[]) {
  return MethodDecoratorFactory.createDecorator('events:listen', messageTypes);
}
