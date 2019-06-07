// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  compareBindingsByTag,
  filterByTag,
  GenericInterceptor,
  GenericInterceptorChain,
  inject,
} from '@loopback/context';
import {Response} from 'express';
import {RestBindings, RestTags} from './keys';
import {RequestContext} from './request-context';
import {OperationRetval, RestAction, RestInterceptor} from './types';
import {writeResultToResponse} from './writer';

/**
 * A sequence function is a function implementing a custom
 * sequence of actions to handle an incoming request.
 */
export type SequenceFunction = (
  context: RequestContext,
  sequence: DefaultSequence,
) => Promise<void> | void;

/**
 * A sequence handler is a class implementing sequence of actions
 * required to handle an incoming request.
 */
export interface SequenceHandler {
  /**
   * Handle the request by running the configured sequence of actions.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  handle(context: RequestContext): Promise<void>;
}

/**
 * Options for a sequence
 */
export type SequenceOptions = {
  /**
   * Order of actions by phase
   */
  orderOfActions?: string[];
  /**
   * Custom list of actions by order
   */
  actions?: RestAction[];
};

const DEFAULT_ORDER_OF_ACTIONS = [
  'reject',
  'send',
  'route',
  'parseParams',
  'invoke',
];
/**
 * The default implementation of SequenceHandler.
 *
 * @remarks
 * This class implements default Sequence for the LoopBack framework.
 * Default sequence is used if user hasn't defined their own Sequence
 * for their application.
 *
 * Sequence constructor() and run() methods are invoked from [[http-handler]]
 * when the API request comes in. User defines APIs in their Application
 * Controller class.
 *
 * @example
 * User can bind their own Sequence to app as shown below
 * ```ts
 * app.bind(CoreBindings.SEQUENCE).toClass(MySequence);
 * ```
 */
export class DefaultSequence implements SequenceHandler {
  constructor(
    @inject(RestBindings.SEQUENCE_OPTIONS, {optional: true})
    private options: SequenceOptions = {},
  ) {}

  /**
   * Runs the default sequence. Given a handler context (request and response),
   * running the sequence will produce a response or an error.
   *
   * Default sequence executes these steps
   *  - Finds the appropriate controller method, swagger spec
   *    and args for invocation
   *  - Parses HTTP request to get API argument list
   *  - Invokes the API which is defined in the Application Controller
   *  - Writes the result from API into the HTTP response
   *  - Error is caught and logged using 'logError' if any of the above steps
   *    in the sequence fails with an error.
   *
   * @param context - The request context: HTTP request and response objects,
   * per-request IoC container and more.
   */
  async handle(context: RequestContext): Promise<void> {
    const restActions: RestAction[] = await this.getActions(context);

    const actionHandlers: GenericInterceptor<
      RequestContext
    >[] = restActions.map(action => (ctx, next) => action.intercept(ctx, next));
    const actionChain = new GenericInterceptorChain(context, actionHandlers);
    await actionChain.invokeInterceptors();
  }

  protected async getActions(context: RequestContext) {
    if (this.options.actions) return this.options.actions;
    const restActionBindings = context
      .find<RestAction>(filterByTag(RestTags.ACTION))
      .sort(
        compareBindingsByTag(
          RestTags.ACTION_PHASE,
          this.options.orderOfActions || DEFAULT_ORDER_OF_ACTIONS,
        ),
      );
    const restActions: RestAction[] = [];
    for (const actionBinding of restActionBindings) {
      let action = await context.get<RestAction | RestInterceptor>(
        actionBinding.key,
      );
      if (typeof action === 'function') {
        action = {
          intercept: action,
        };
      }
      restActions.push(action);
    }
    return restActions;
  }

  send(response: Response, result: OperationRetval) {
    writeResultToResponse(response, result);
  }
}
