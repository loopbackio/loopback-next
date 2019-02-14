// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/context
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {EventEmitter} from 'events';
import {
  ContextEventObserver,
  ContextEventType,
  Notification,
  Subscription,
  ContextObserver,
} from './context-observer';
import {Context} from './context';
import {ContextSubscription} from './context-subscription';
import {Binding} from './binding';

// FIXME: `@types/p-event` is out of date against `p-event@2.2.0`
const pEvent = require('p-event');

export class ContextEventNotifier extends EventEmitter {
  /**
   * A list of registered context observers. The Set will be created when the
   * first observer is added.
   */
  protected observers: Set<ContextEventObserver> | undefined;

  /**
   * Internal counter for pending notification events which are yet to be
   * processed by observers.
   */
  private pendingNotifications = 0;

  /**
   * Queue for background notifications for observers
   */
  private notificationQueue: AsyncIterableIterator<Notification> | undefined;

  constructor(
    // tslint:disable-next-line:no-any
    private _debug: (...args: any[]) => void,
  ) {
    super();
  }

  /**
   * Add a context event observer to the context
   * @param observer Context observer instance or function
   */
  subscribe(observer: ContextEventObserver): Subscription {
    this.observers = this.observers || new Set();
    this.observers.add(observer);
    return new ContextSubscription(this, observer);
  }

  /**
   * Remove the context event observer from the context
   * @param observer Context event observer
   */
  unsubscribe(observer: ContextEventObserver): boolean {
    if (!this.observers) return false;
    return this.observers.delete(observer);
  }

  /**
   * Check if an observer is subscribed to this context
   * @param observer Context observer
   */
  isSubscribed(observer: ContextObserver) {
    if (!this.observers) return false;
    return this.observers.has(observer);
  }

  /**
   * Start a background task to listen on context events and notify observers
   */
  start(): Promise<void> {
    // Set up listeners on `bind` and `unbind` for notifications
    this.setupNotification('bind', 'unbind');

    // Create an async iterator for the `notification` event as a queue
    this.notificationQueue = pEvent.iterator(this, 'notification');

    return this.processNotifications();
  }

  /*
   * Close the notifier and release references to other objects.
   */
  async close() {
    this.observers = undefined;

    // Cancel the notification iterator
    if (!this.notificationQueue) return;
    await this.notificationQueue.return!(undefined);
    this.notificationQueue = undefined;
  }

  /**
   * Wait until observers are notified for all of currently pending notification
   * events.
   */
  async waitUntilPendingNotificationsDone(timeout?: number) {
    const count = this.pendingNotifications;
    if (count === 0) return;
    return pEvent.multiple(this, 'observersNotified', {count, timeout});
  }

  /**
   * Listen on given event types and emit `notification` event. This method
   * merge multiple event types into one for notification.
   * @param eventTypes Context event types
   */
  private setupNotification(...eventTypes: ContextEventType[]): void {
    for (const eventType of eventTypes) {
      this.on(eventType, (binding, context) => {
        // No need to schedule notifications if no observers are present
        if (!this.observers || this.observers.size === 0) return;
        // Track pending events
        this.pendingNotifications++;
        // Take a snapshot of current observers to ensure notifications of this
        // event will only be sent to current ones. Emit a new event to notify
        // current context observers.
        this.emit('notification', {
          eventType,
          binding,
          context,
          observers: new Set(this.observers),
        });
      });
    }
  }

  /**
   * Process notification events as they arrive on the queue
   */
  private async processNotifications(): Promise<void> {
    const events = this.notificationQueue;
    if (events == null) return;
    for await (const {eventType, binding, context, observers} of events) {
      // The loop will happen asynchronously upon events
      try {
        // The execution of observers happen in the Promise micro-task queue
        await this.notifyObservers(eventType, binding, context, observers);
        this.pendingNotifications--;
        this._debug(
          'Observers notified for %s of binding %s',
          eventType,
          binding.key,
        );
        this.emit('observersNotified', {eventType, binding});
      } catch (err) {
        this.pendingNotifications--;
        this._debug('Error caught from observers', err);
        // Errors caught from observers. Emit it to the current context.
        // If no error listeners are registered, crash the process.
        this.emit('error', err);
      }
    }
  }

  /**
   * Publish an event to the registered observers. Please note the
   * notification is queued and performed asynchronously so that we allow fluent
   * APIs such as `ctx.bind('key').to(...).tag(...);` and give observers the
   * fully populated binding.
   *
   * @param eventType Event names: `bind` or `unbind`
   * @param binding Binding bound or unbound
   * @param context Owner context
   * @param observers Current set of context observers
   */
  protected async notifyObservers(
    eventType: ContextEventType,
    binding: Readonly<Binding<unknown>>,
    context: Context,
    observers = this.observers,
  ): Promise<void> {
    if (!observers || observers.size === 0) return;

    for (const observer of observers) {
      if (typeof observer === 'function') {
        await observer(eventType, binding, context);
      } else if (!observer.filter || observer.filter(binding)) {
        await observer.observe(eventType, binding, context);
      }
    }
  }
}
