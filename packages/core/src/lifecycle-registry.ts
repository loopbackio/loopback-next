// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Context,
  ContextView,
  inject,
  invokeMethod,
  sortBindingsByPhase,
} from '@loopback/context';
import debugFactory from 'debug';
import {CoreBindings, CoreTags} from './keys';
import {LifeCycleObserver, lifeCycleObserverFilter} from './lifecycle';
const debug = debugFactory('loopback:core:lifecycle');

/**
 * A group of life cycle observers
 */
export type LifeCycleObserverGroup = {
  /**
   * Observer group name
   */
  group: string;
  /**
   * Bindings for observers within the group
   */
  bindings: Readonly<Binding<LifeCycleObserver>>[];
};

export type LifeCycleObserverOptions = {
  /**
   * Control the order of observer groups for notifications. For example,
   * with `['datasource', 'server']`, the observers in `datasource` group are
   * notified before those in `server` group during `start`. Please note that
   * observers are notified in the reverse order during `stop`.
   */
  orderedGroups: string[];
  /**
   * Override and disable lifecycle observer groups. This setting applies to
   * both ordered groups (i.e. those defined in `orderedGroups`) and unordered
   * groups.
   */
  disabledGroups?: string[];
  /**
   * Notify observers of the same group in parallel, default to `true`
   */
  parallel?: boolean;
};

export const DEFAULT_ORDERED_GROUPS = ['server'];

/**
 * A context-based registry for life cycle observers
 */
export class LifeCycleObserverRegistry implements LifeCycleObserver {
  constructor(
    @inject.context()
    protected readonly context: Context,
    @inject.view(lifeCycleObserverFilter)
    protected readonly observersView: ContextView<LifeCycleObserver>,
    @inject(CoreBindings.LIFE_CYCLE_OBSERVER_OPTIONS, {optional: true})
    protected readonly options: LifeCycleObserverOptions = {
      parallel: true,
      orderedGroups: DEFAULT_ORDERED_GROUPS,
    },
  ) {}

  setOrderedGroups(groups: string[]) {
    this.options.orderedGroups = groups;
  }

  /**
   * Get observer groups ordered by the group
   */
  public getObserverGroupsByOrder(): LifeCycleObserverGroup[] {
    const bindings = this.observersView.bindings;
    const groups = this.sortObserverBindingsByGroup(bindings);
    if (debug.enabled) {
      debug(
        'Observer groups: %j',
        groups.map(g => ({
          group: g.group,
          bindings: g.bindings.map(b => b.key),
        })),
      );
    }
    return groups;
  }

  /**
   * Get the group for a given life cycle observer binding
   * @param binding - Life cycle observer binding
   */
  protected getObserverGroup(
    binding: Readonly<Binding<LifeCycleObserver>>,
  ): string {
    // First check if there is an explicit group name in the tag
    let group = binding.tagMap[CoreTags.LIFE_CYCLE_OBSERVER_GROUP];
    if (!group) {
      // Fall back to a tag that matches one of the groups
      group = this.options.orderedGroups.find(g => binding.tagMap[g] === g);
    }
    group = group || '';
    debug(
      'Binding %s is configured with observer group %s',
      binding.key,
      group,
    );
    return group;
  }

  /**
   * Sort the life cycle observer bindings so that we can start/stop them
   * in the right order. By default, we can start other observers before servers
   * and stop them in the reverse order
   * @param bindings - Life cycle observer bindings
   */
  protected sortObserverBindingsByGroup(
    bindings: Readonly<Binding<LifeCycleObserver>>[],
  ) {
    // Group bindings in a map
    const groupMap: Map<string, Readonly<Binding<LifeCycleObserver>>[]> =
      new Map();
    sortBindingsByPhase(
      bindings,
      CoreTags.LIFE_CYCLE_OBSERVER_GROUP,
      this.options.orderedGroups,
    );
    for (const binding of bindings) {
      const group = this.getObserverGroup(binding);
      let bindingsInGroup = groupMap.get(group);
      if (bindingsInGroup == null) {
        bindingsInGroup = [];
        groupMap.set(group, bindingsInGroup);
      }
      bindingsInGroup.push(binding);
    }
    // Create an array for group entries
    const groups: LifeCycleObserverGroup[] = [];
    for (const [group, bindingsInGroup] of groupMap) {
      groups.push({group, bindings: bindingsInGroup});
    }
    return groups;
  }

  /**
   * Notify an observer group of the given event
   * @param group - A group of bindings for life cycle observers
   * @param event - Event name
   */
  protected async notifyObservers(
    observers: LifeCycleObserver[],
    bindings: Readonly<Binding<LifeCycleObserver>>[],
    event: keyof LifeCycleObserver,
  ) {
    if (!this.options.parallel) {
      let index = 0;
      for (const observer of observers) {
        debug(
          'Invoking %s observer for binding %s',
          event,
          bindings[index].key,
        );
        index++;
        await this.invokeObserver(observer, event);
      }
      return;
    }

    // Parallel invocation
    const notifiers = observers.map((observer, index) => {
      debug('Invoking %s observer for binding %s', event, bindings[index].key);
      return this.invokeObserver(observer, event);
    });
    await Promise.all(notifiers);
  }

  /**
   * Invoke an observer for the given event
   * @param observer - A life cycle observer
   * @param event - Event name
   */
  protected async invokeObserver(
    observer: LifeCycleObserver,
    event: keyof LifeCycleObserver,
  ) {
    if (typeof observer[event] === 'function') {
      // Supply `undefined` for legacy callback function expected by
      // DataSource.stop()
      await invokeMethod(observer, event, this.context, [undefined], {
        skipInterceptors: true,
      });
    }
  }

  /**
   * Emit events to the observer groups
   * @param events - Event names
   * @param groups - Observer groups
   */
  protected async notifyGroups(
    events: (keyof LifeCycleObserver)[],
    groups: LifeCycleObserverGroup[],
    reverse = false,
  ) {
    const observers = await this.observersView.values();
    const bindings = this.observersView.bindings;
    const found = observers.some(observer =>
      events.some(e => typeof observer[e] === 'function'),
    );
    if (!found) return;
    if (reverse) {
      // Do not reverse the original `groups` in place
      groups = [...groups].reverse();
    }
    for (const group of groups) {
      if (this.options.disabledGroups?.includes(group.group)) {
        debug('Notification skipped (Group is disabled): %s', group.group);
        continue;
      }
      const observersForGroup: LifeCycleObserver[] = [];
      const bindingsInGroup = reverse
        ? group.bindings.reverse()
        : group.bindings;
      for (const binding of bindingsInGroup) {
        const index = bindings.indexOf(binding);
        observersForGroup.push(observers[index]);
      }

      for (const event of events) {
        debug('Beginning notification %s of %s...', event);
        await this.notifyObservers(observersForGroup, group.bindings, event);
        debug('Finished notification %s of %s', event);
      }
    }
  }

  /**
   * Notify all life cycle observers by group of `init`
   */
  public async init(): Promise<void> {
    debug('Initializing the %s...');
    const groups = this.getObserverGroupsByOrder();
    await this.notifyGroups(['init'], groups);
  }

  /**
   * Notify all life cycle observers by group of `start`
   */
  public async start(): Promise<void> {
    debug('Starting the %s...');
    const groups = this.getObserverGroupsByOrder();
    await this.notifyGroups(['start'], groups);
  }

  /**
   * Notify all life cycle observers by group of `stop`
   */
  public async stop(): Promise<void> {
    debug('Stopping the %s...');
    const groups = this.getObserverGroupsByOrder();
    // Stop in the reverse order
    await this.notifyGroups(['stop'], groups, true);
  }
}
