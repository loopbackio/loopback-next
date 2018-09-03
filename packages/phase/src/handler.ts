// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/phase
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

const debug = require('debug')('loopback:phase');

// tslint:disable:no-any

/**
 * ExecutionContext for the invocation of handlers by phase
 */
export interface ExecutionContext {
  [name: string]: any;
  /**
   * Error caught during the invocation
   */
  error?: any;
}

/**
 * Options for execution of handlers
 */
export interface ExecutionOptions {
  /**
   * Controls if handlers will be executed in parallel
   */
  parallel?: boolean;

  /**
   * Fail on first error, default to `true`. This flag is only honored if
   * `parallel` `false`.
   */
  failFast?: boolean;
}

/**
 * A function that takes the context
 */
export interface Runnable {
  /**
   * @param ctx: ExecutionContext
   */
  (ctx: ExecutionContext): Promise<void> | void;
}

/**
 * Handler function to be executed within a chain
 */
export interface Handler {
  /**
   * @param ctx: ExecutionContext
   * @param chain: Optional handler chain if the handler is invoked as part of
   * an invocation chain of handlers
   */
  (ctx: ExecutionContext, chain: HandlerChain): Promise<void> | void;
  description?: string;
}

/**
 * Handler chain that allows its handlers to control how to proceed:
 *
 * - next: call downstream handlers
 * - stop: mark the handler chain is done
 * - throw: throw an error to abort the handler chain
 */
export class HandlerChain {
  /**
   * Indicate if the end of invocation chain is reached or the work is done
   */
  done?: boolean;

  constructor(private ctx: ExecutionContext, private handlers: Handler[]) {
    this.done = false;
  }

  /**
   * Run the downstream handlers
   * @param ctx Optional context, default to `this.ctx`
   */
  async next(ctx: ExecutionContext = this.ctx): Promise<void> {
    if (this.done) {
      throw new Error('The handler chain is done.');
    }
    // Mark the chain as `done` because the handler has already called `next`
    // to run downstream handlers
    this.stop();
    debug('Dispatch to downstream handlers (%s)', this);
    if (this.handlers.length > 1) {
      await asRunnable(this.handlers.slice(1))(ctx);
    }
  }

  /**
   * Mark the context as `done` to stop execution of the handler chain
   */
  stop(): void {
    debug('Stop the handler chain (%s)', this);
    this.done = true;
  }

  /**
   * Throw an error to abort execution of the handler chain
   * @param err Error
   */
  throw(err: any): void {
    debug('Throw an error to abort the handler chain (%s)', this, err);
    throw err;
  }

  toString() {
    const chain = this.handlers.map(h => h.description || '');
    const current = chain[0] || '<END>';
    return `${chain.join('->')}: ${current}`;
  }
}

/**
 * Create a function that executes the given handlers sequentially
 * @param handlers Array of handlers
 */
export function asRunnable(
  handlers: Handler[],
  options: ExecutionOptions = {},
): Runnable {
  return async (ctx: ExecutionContext) => {
    if (options.parallel) {
      const chain = new HandlerChain(ctx, []);
      debug('Executing handlers in parallel');
      await Promise.all(handlers.map(h => h(ctx, chain)));
      return;
    }
    for (let i = 0; i < handlers.length; i++) {
      const handlerChain = new HandlerChain(ctx, handlers.slice(i));
      const handler = handlers[i];
      try {
        debug('Executing handler %d: %s', i, handler.description);
        await handler(ctx, handlerChain);
      } catch (e) {
        debug('Error throw from %s', handler.description, e);
        if (options.failFast !== false) {
          throw e;
        }
        debug('Error is caught and set as ctx.error', e);
        ctx.error = e;
      }
      if (handlerChain.done === true) {
        debug('Handler chain is marked as done: %s', handlerChain);
        return;
      }
    }
    debug('End of handler chain is reached: %s');
  };
}
