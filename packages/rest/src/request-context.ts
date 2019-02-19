// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import * as onFinished from 'on-finished';
import {RestBindings} from './keys';
import {HandlerContext, Request, Response} from './types';

/**
 * A per-request Context combining an IoC container with handler context
 * (request, response, etc.).
 */
export class RequestContext extends Context implements HandlerContext {
  constructor(
    public readonly request: Request,
    public readonly response: Response,
    parent: Context,
    name?: string,
  ) {
    super(parent, name);
    this._setupBindings(request, response);
    onFinished(this.response, () => {
      this.close();
    });
  }

  private _setupBindings(request: Request, response: Response) {
    this.bind(RestBindings.Http.REQUEST)
      .to(request)
      .lock();

    this.bind(RestBindings.Http.RESPONSE)
      .to(response)
      .lock();

    this.bind(RestBindings.Http.CONTEXT)
      .to(this)
      .lock();
  }
}
