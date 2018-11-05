// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  AsyncEventEmitter,
  ListenerRegistry,
  EventName,
  Listener,
} from './types';
import {DefaultListenerRegistry} from './listener-registry';

/**
 * A class constructor accepting arbitrary arguments.
 */
export type Constructor<T> =
  // tslint:disable-next-line:no-any
  new (...args: any[]) => T;

export function EventSourceMixin<C extends Constructor<object>>(superClass: C) {
  return class extends superClass implements AsyncEventEmitter {
    readonly registry: ListenerRegistry = new DefaultListenerRegistry();

    // tslint:disable-next-line:no-any
    constructor(...args: any[]) {
      super(...args);
    }

    getListeners(eventName: EventName) {
      return this.registry.getListeners(this, eventName);
    }

    subscribe<T>(eventName: EventName<T>, listener: Listener<T>) {
      return this.registry.subscribe(this, eventName, listener);
    }

    once<T>(eventName: EventName<T>, listener: Listener<T>) {
      return this.registry.once(this, eventName, listener);
    }

    unsubscribe<T>(eventName: EventName<T>, listener: Listener<T>) {
      return this.registry.unsubscribe(this, eventName, listener);
    }

    emit<T>(eventName: EventName<T>, event: T) {
      return this.registry.emit<T>(this, eventName, event);
    }

    async notify<T>(eventName: EventName<T>, event: T) {
      return this.registry.notify(this, eventName, event);
    }
  };
}

/**
 * Event source
 */
export class EventSource implements AsyncEventEmitter {
  protected readonly registry: ListenerRegistry;
  protected readonly source: object;

  constructor(source?: object, registry?: ListenerRegistry) {
    this.source = source || this;
    this.registry = registry || new DefaultListenerRegistry();
  }

  getListeners(eventName: EventName) {
    return this.registry.getListeners(this.source, eventName);
  }

  subscribe<T>(eventName: EventName<T>, listener: Listener<T>) {
    return this.registry.subscribe(this.source, eventName, listener);
  }

  once<T>(eventName: EventName<T>, listener: Listener<T>) {
    return this.registry.once(this.source, eventName, listener);
  }

  unsubscribe<T>(eventName: EventName<T>, listener: Listener<T>) {
    return this.registry.unsubscribe(this.source, eventName, listener);
  }

  emit<T>(eventName: EventName<T>, event: T) {
    return this.registry.emit<T>(this.source, eventName, event);
  }

  async notify<T>(eventName: EventName<T>, event: T) {
    return this.registry.notify(this.source, eventName, event);
  }
}
