// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  ListenerRegistry,
  Listener,
  EventName,
  AsyncEventEmitter,
} from './types';
import {EventSource} from './event-source';

/**
 * An entry of listener registration
 */
interface ListenerEntry {
  listener: Listener;
  once: boolean;
}

/**
 * An map of listeners keyed by event types
 */
interface ListenerMap {
  [eventName: string]: ListenerEntry[];
}

/**
 * Default in-memory implementation of ListenerRegistry
 */
export class DefaultListenerRegistry implements ListenerRegistry {
  protected readonly registry = new WeakMap<object, ListenerMap>();

  /**
   * Emit an event to the given listener
   * @param source Event source
   * @param listenerEntry Listener entry
   * @param eventName Event Name
   * @param event Event data
   */
  private emitEvent(
    source: object,
    listenerEntry: ListenerEntry,
    eventName: EventName,
    event: unknown,
  ) {
    const listener = listenerEntry.listener;
    if (listenerEntry.once) {
      this.unsubscribe(source, eventName, listener);
    }
    if (typeof listener === 'function') {
      return listener(event, eventName);
    }
    if (typeof listener.listen === 'function') {
      return listener.listen(event, eventName);
    }
    throw new Error(`Invalid listener: ${listener}`);
  }

  private getListenerEntries(source: object, eventName: EventName) {
    let listenerMap = this.registry.get(source);
    if (!listenerMap) return [];
    return listenerMap[eventName.toString()] || [];
  }

  getListeners(source: object, eventName: EventName) {
    return this.getListenerEntries(source, eventName).map(e => e.listener);
  }

  subscribe<T>(source: object, eventName: EventName<T>, listener: Listener<T>) {
    const name = eventName.toString();
    let listenerMap = this.registry.get(source);
    if (!listenerMap) {
      listenerMap = {};
      this.registry.set(source, listenerMap);
    }
    let listeners = listenerMap[name];
    if (!listeners) {
      listeners = [];
      listenerMap[name] = listeners;
    }
    listeners.push({listener, once: false});
    return {
      cancel: () => {
        this.unsubscribe(source, eventName, listener);
      },
    };
  }

  once<T>(source: object, eventName: EventName<T>, listener: Listener<T>) {
    const name = eventName.toString();
    let listenerMap = this.registry.get(source);
    if (!listenerMap) {
      listenerMap = {};
      this.registry.set(source, listenerMap);
    }
    let listeners = listenerMap[name];
    if (!listeners) {
      listeners = [];
      listenerMap[name] = listeners;
    }
    listeners.push({listener, once: true});
    return {
      cancel: () => {
        this.unsubscribe(source, eventName, listener);
      },
    };
  }

  unsubscribe<T>(
    source: object,
    eventName: EventName<T>,
    listener: Listener<T>,
  ) {
    const listeners = this.getListenerEntries(source, eventName);
    const index = listeners.findIndex(e => e.listener === listener);
    if (index === -1) return false;
    listeners.splice(index, 1);
    return true;
  }

  async notify<T>(source: object, eventName: EventName<T>, event: T) {
    const listeners = this.getListenerEntries(source, eventName);
    for (const listener of listeners) {
      await this.emitEvent(source, listener, eventName, event);
    }
  }

  async emit<T>(source: object, eventName: EventName<T>, event: T) {
    const listeners = this.getListenerEntries(source, eventName);
    const promises = listeners.map(listener =>
      this.emitEvent(source, listener, eventName, event),
    );
    await Promise.all(promises);
  }

  createEventEmitter(source: object): AsyncEventEmitter {
    return new EventSource(source, this);
  }
}
