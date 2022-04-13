// Copyright IBM Corp. and LoopBack contributors 2020. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Binding} from './binding';
import {Context} from './context';

/**
 * Events emitted by a context
 */
export type ContextEvent = {
  /**
   * Source context that emits the event
   */
  context: Context;
  /**
   * Binding that is being added/removed/updated
   */
  binding: Readonly<Binding<unknown>>;
  /**
   * Event type
   */
  type: string; // 'bind' or 'unbind'
};

/**
 * Synchronous listener for context events
 */
export type ContextEventListener = (event: ContextEvent) => void;
