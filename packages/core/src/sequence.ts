// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Context,
  Constructor,
  BindingScope,
  invokeMethod,
} from '@loopback/context';

import {
  ActionGraph,
  ActionMethod,
  sortActions,
  GraphvizNodeAttributes,
} from './action';

// tslint:disable:no-any
/**
 * Sequence represents collaboration of actions to handle API request/response
 */
export class Sequence extends Context {
  public actionGraph: ActionGraph;

  constructor(private actionClasses: Constructor<any>[], ctx?: Context) {
    super(ctx);
    this.bindClasses();
    this.buildGraph();
  }

  private bindClasses() {
    for (const c of this.actionClasses) {
      this.bind('actions.' + c.name)
        .toClass(c)
        .inScope(BindingScope.SINGLETON);
    }
  }

  private buildGraph() {
    if (!this.actionGraph) {
      this.actionGraph = sortActions(this.actionClasses, true, false);
    }
    return this.actionGraph;
  }

  /**
   * Generate a DOT diagram
   */
  toDOT(attrs?: GraphvizNodeAttributes) {
    return this.buildGraph().toDot(attrs);
  }

  /**
   * Invoke an action method within the context
   * @param ctx Context for the invocation
   * @param method Action method
   */
  static async invokeActionMethod(ctx: Context, method: ActionMethod) {
    let target;
    if (method.isStatic) {
      target = method.target;
    } else {
      target = await ctx.get('actions.' + method.actionClass!.target.name);
    }
    const result = await invokeMethod(target, method.method, ctx);
    if (result !== undefined && method.bindsReturnValueAs) {
      ctx.bind(method.bindsReturnValueAs).to(result);
    }
    return result;
  }

  /**
   * Run actions within the sequence based on the dependency graph
   */
  async run() {
    for (const m of this.actionGraph.actions.filter((a: any) => !!a.method)) {
      await Sequence.invokeActionMethod(this, m);
    }
  }

  /**
   * Reset the sequence
   */
  reset() {
    this.registry.clear();
    this.bindClasses();
    this.buildGraph();
  }
}

/**
 * In-memory PubSub
 */
export class ActionPubSub {
  constructor(public context: Context) {}

  /**
   * Subscribers (action methods) are keyed by topics
   */
  public readonly subscribers: Map<string, ActionMethod[]> = new Map<
    string,
    ActionMethod[]
  >();

  /**
   * Subscribe an action method to the given topic
   * @param topic Topic of the subscription
   * @param method Action method
   */
  subscribe(topic: string, method: ActionMethod) {
    let actions = this.subscribers.get(topic);
    if (!actions) {
      actions = [method];
      this.subscribers.set(topic, actions);
    } else {
      actions.push(method);
    }
  }

  /**
   * Unsubscribe an action method from the given topic
   * @param topic Topic of the subscription
   * @param method Action method
   */
  unsubscribe(topic: string, method: ActionMethod): boolean {
    let actions = this.subscribers.get(topic);
    if (!actions) {
      return false;
    } else {
      const index = actions.indexOf(method);
      if (index === -1) return false;
      actions.splice(index, 1);
      return true;
    }
  }

  /**
   * Unsubscribe all action methods from the given topic
   * @param topic Topic of the subscription
   */
  unsubscribeTopic(topic: string) {
    const result = this.subscribers.get(topic);
    this.subscribers.delete(topic);
    return result || [];
  }

  /**
   * Unsubscribe the action method from all topics
   * @param method Action method
   */
  unsubscribeAll(method: ActionMethod) {
    const topics = [];
    for (const e of this.subscribers.entries()) {
      const index = e[1].indexOf(method);
      if (index === -1) continue;
      topics.push(e[0]);
      e[1].splice(index, 1);
    }
    return topics;
  }

  /**
   * Get a list of subscribed topics for the given action method
   * @param method Action method
   */
  subscribedTopics(method: ActionMethod) {
    const topics = [];
    for (const e of this.subscribers.entries()) {
      const index = e[1].indexOf(method);
      if (index === -1) continue;
      topics.push(e[0]);
    }
    return topics;
  }

  /**
   * Get a list of subscribers for a given topic
   * @param topic Topic name
   */
  subscribersOf(topic: string) {
    return this.subscribers.get(topic);
  }

  /**
   * Get a list of topics
   */
  topics() {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Publish an event to the given topic which in turn triggers asynchronous
   * invocations of all subscribed action methods of the topic
   *
   * @param topic Topic of the subscription
   * @param event Event data
   */
  publish(topic: string, event: any) {
    let actions = this.subscribersOf(topic);
    if (actions) {
      return Promise.all(
        actions.map(method => {
          return Sequence.invokeActionMethod(this.context, method);
        }),
      );
    }
    return Promise.resolve([]);
  }

  /**
   * Reset the subscription by removing all topics & subscribers
   */
  reset() {
    this.subscribers.clear();
  }
}
