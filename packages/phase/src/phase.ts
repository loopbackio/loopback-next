// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:phase');
import {
  Handler,
  asRunnable,
  ExecutionContext,
  ExecutionOptions,
} from './handler';

/**
 * Options for a phase
 */
export interface PhaseOptions extends ExecutionOptions {
  /**
   * Id or name of a phase
   */
  id?: string;
}

/**
 * A slice of time in an application. Provides hooks to allow
 * functions to be executed before, during and after, the defined slice.
 * Handlers can be registered to a phase using `before()`, `use()`, or `after()`
 * so that they are placed into one of the three stages.
 *
 * ```ts
 * import {Phase} from '@loopback/phase';
 *
 * // Create a phase without id
 * const anonymousPhase = new Phase();
 *
 * // Create a named phase
 * const myPhase1 = new Phase('my-phase');
 *
 * // Create a named phase with id & options
 * const myPhase2 = new Phase('my-phase', {parallel: true});
 *
 * // Create a named phase with options only
 * const myPhase3 = new Phase({id: 'my-phase', parallel: true});
 *
 * ```
 */

export class Phase {
  /**
   * The name or identifier of the `Phase`.
   */
  readonly id: string;
  /**
   * options The options to configure the `Phase`
   */
  readonly options: PhaseOptions;
  /**
   * Handlers to be invoked during the phase
   */
  readonly handlers: Handler[];
  /**
   * Handlers to be invoked before the phase
   */
  readonly beforeHandlers: Handler[];
  /**
   * Handlers to be invoked after the phase
   */
  readonly afterHandlers: Handler[];

  /**
   * Cache for handlers
   */
  private _handlers: Handler[] | undefined;

  /**
   * @param [id] The name or identifier of the `Phase`.
   * @param [options] Options for the `Phase`
   */
  constructor(id?: string | PhaseOptions, options?: PhaseOptions) {
    if (typeof id === 'string') {
      this.id = id;
    }
    if (typeof id === 'object' && options === undefined) {
      options = id;
      id = options.id;
      this.id = id!;
    }
    this.options = options || {};
    this.handlers = [];
    this.beforeHandlers = [];
    this.afterHandlers = [];
  }

  /**
   * Wrap the handler function to add `description` for debugging
   * @param handler
   * @param subPhase
   * @param index
   */
  private wrap(handler: Handler, subPhase: string, index?: number): Handler {
    let fn = handler;
    if (debug.enabled) {
      fn = (ctx, chain) => handler(ctx, chain);
      const name = handler.name ? `: ${handler.name}` : '';
      const pos = index == null ? '' : index;
      const suffix = subPhase ? `:${subPhase}` : '';
      fn.description = `${this.id}${suffix}[${pos}]${name}`;
    }
    return fn;
  }

  /**
   * Register a phase handler. The handler will be executed
   * once the phase is launched. Handlers return a promise.
   *
   * **Example**
   *
   * ```js
   * phase.use(ctx => {
   *   console.log(ctx.message, 'world!'); // => hello world
   * });
   *
   * await phase.run({message: 'hello'});
   * console.log('phase has finished');
   *
   * ```
   */
  use(handler: Handler): this {
    this._handlers = undefined;
    this.handlers.push(handler);
    return this;
  }

  /**
   * Register a phase handler to be executed before the phase begins.
   * See `use()` for an example.
   *
   * @param handler
   */
  before(handler: Handler): this {
    this.beforeHandlers.push(handler);
    return this;
  }

  /**
   * Register a phase handler to be executed after the phase completes.
   * See `use()` for an example.
   *
   * @param handler
   */
  after(handler: Handler): this {
    this.afterHandlers.push(handler);
    return this;
  }

  /**
   * Execute all handlers within the phase
   * @param ctx
   */
  async run(ctx: ExecutionContext = {}) {
    await asRunnable(this.getHandlers(), {
      parallel: false, // Parallel does not go beyond sub phases
      failFast: this.options.failFast,
    })(ctx);
  }

  /**
   * Get a list of handlers
   */
  getHandlers(): Handler[] {
    if (this._handlers) return this._handlers;
    const handlers: Handler[] = (this._handlers = []);
    if (this.options.parallel) {
      handlers.push(
        this.wrap(asRunnable(this.beforeHandlers, this.options), 'before', 0),
        this.wrap(asRunnable(this.handlers, this.options), '', 0),
        this.wrap(asRunnable(this.afterHandlers, this.options), 'after', 0),
      );
    } else {
      handlers.push(
        ...this.beforeHandlers.map((h, i) => this.wrap(h, 'before', i)),
        ...this.handlers.map((h, i) => this.wrap(h, '', i)),
        ...this.afterHandlers.map((h, i) => this.wrap(h, 'after', i)),
      );
    }
    return handlers;
  }

  /**
   * Return the `Phase` as a string.
   */
  toString() {
    return this.id;
  }
}
