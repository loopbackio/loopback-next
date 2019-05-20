// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter, inject, Next} from '@loopback/context';
import {RestBindings} from '../keys';
import {
  HttpContext,
  OperationRetval,
  Response,
  RestAction,
  restAction,
  Send,
} from '../types';
import {writeResultToResponse} from '../writer';

/**
 * Provides the function that populates the response object with
 * the results of the operation.
 *
 * @returns The handler function that will populate the
 * response with operation results.
 */
@restAction('send')
export class SendAction implements RestAction {
  constructor(
    @inject.getter(RestBindings.OPERATION_RESULT, {optional: true})
    private getReturnValue: Getter<OperationRetval>,
  ) {}

  async action(ctx: HttpContext, next: Next) {
    const result = await next();
    const returnVal = await this.getReturnValue();
    this.send(ctx.response, returnVal || result);
  }

  send(response: Response, result: OperationRetval) {
    writeResultToResponse(response, result);
  }

  get handler(): Send {
    return this.send.bind(this);
  }
}
