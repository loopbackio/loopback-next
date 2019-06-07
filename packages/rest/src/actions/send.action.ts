// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Next} from '@loopback/context';
import {RestBindings} from '../keys';
import {
  HttpContext,
  OperationRetval,
  Response,
  restAction,
  Send,
} from '../types';
import {writeResultToResponse} from '../writer';
import {BaseRestAction} from './base-action';

/**
 * Provides the function that populates the response object with
 * the results of the operation.
 *
 * @returns The handler function that will populate the
 * response with operation results.
 */
@restAction('send')
export class SendAction extends BaseRestAction {
  constructor() {
    super();
  }

  async intercept(ctx: HttpContext, next: Next) {
    await next();
    return this.delegate(ctx, 'send');
  }

  send(
    @inject(RestBindings.Http.RESPONSE) response: Response,
    @inject(RestBindings.OPERATION_RESULT, {optional: true})
    result: OperationRetval,
  ) {
    writeResultToResponse(response, result);
  }

  get handler(): Send {
    return this.send.bind(this);
  }
}
