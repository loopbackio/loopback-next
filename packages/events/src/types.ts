// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/events
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

export type EventName<T = unknown> = string | EventType<T>;

// tslint:disable-next-line:no-unused-variable
export class EventType<T> {
  public static create<T>(name: string): EventType<T> {
    return new EventType(name);
  }

  private constructor(public readonly name: string) {}

  toString() {
    return this.name;
  }
}

/**
 * Async event listener function
 */
export type ListenerFunction<T> = (
  /**
   * Event data
   */
  event: T,
  /**
   * Event Name
   */
  eventName: EventName,
) => Promise<void>;

/**
 * Async event listener Object
 */
export interface ListenerObject<T> {
  /**
   * An optional name of the listener
   */
  name?: string;
  /**
   * Process an event
   * @param event Event data
   * @param eventName Event Name
   */
  listen(event: T, eventName: EventName<T>): Promise<void>;
}

/**
 * A listener object or function
 */
export type Listener<T = unknown> = ListenerObject<T> | ListenerFunction<T>;

/**
 * A subscription
 */
export interface Subscription {
  /**
   * Cancel the subscription
   */
  cancel(): void;
}

/**
 * An interface to describe an observable object
 */
export interface AsyncEventEmitter {
  /**
   * Get a list of listeners for the given source object and event type
   * @param source Source object
   * @param eventName Event name
   */
  getListeners(eventName: EventName): Listener[];

  /**
   * Subscribe to an event type
   * @param eventName Event name
   * @param listener An async event listener
   */
  subscribe(eventName: EventName, listener: Listener): Subscription;

  /**
   * Subscribe to an event type for once
   * @param eventName Event name
   * @param listener An async event listener
   */
  once(eventName: EventName, listener: Listener): Subscription;

  /**
   * Unsubscribe to an event type
   * @param eventName Event Name
   * @param listener An async event listener
   */
  unsubscribe(eventName: EventName, listener: Listener): boolean;

  /**
   * Emit an event to all listeners in parallel
   * @param eventName Event Name
   * @param event Event data
   */
  emit<T>(eventName: EventName, event: T): Promise<void>;

  /**
   * Notify listeners one by one with an event for the given type. It
   * will wait for the completion of listeners to process the event.
   * @param eventName Event Name
   * @param event Event data
   */
  notify<T>(eventName: EventName, event: T): Promise<void>;
}

/**
 * A registry for observable objects
 */
export interface ListenerRegistry {
  /**
   * Get a list of listeners for the given source object and event type
   * @param source Source object
   * @param eventName Event Name
   */
  getListeners(source: object, eventName: EventName): Listener[];

  /**
   * Subscribe to an event source and name
   * @param source Source object
   * @param eventName Event Name
   * @param listener An async event listener
   */
  subscribe<T>(
    source: object,
    eventName: EventName<T>,
    listener: Listener<T>,
  ): Subscription;

  /**
   * Subscribe to an event source and name for once
   * @param source Source object
   * @param eventName Event Name
   * @param listener An async event listener
   */
  once<T>(
    source: object,
    eventName: EventName<T>,
    listener: Listener<T>,
  ): Subscription;

  /**
   * Unsubscribe to an event source and name
   * @param source Source object
   * @param eventName Event Name
   * @param listener An async event listener
   */
  unsubscribe<T>(
    source: object,
    eventName: EventName<T>,
    listener: Listener<T>,
  ): boolean;

  /**
   * Emit an event for the event source/type. It will not wait for the
   * completion of listeners to process the event.
   * @param source Source object
   * @param eventName Event Name
   * @param event Event data
   */
  emit<T>(source: object, eventName: EventName<T>, event: T): Promise<void>;

  /**
   * Notify listeners one by one with an event for the event source/type. It
   * will wait for the completion of listeners to process the event.
   * @param source Source object
   * @param eventName Event Name
   * @param event Event data
   */
  notify<T>(source: object, eventName: EventName<T>, event: T): Promise<void>;

  /**
   * Wrap an object to be an async event emitter
   * @param source Source object
   */
  createEventEmitter(source: object): AsyncEventEmitter;
}
