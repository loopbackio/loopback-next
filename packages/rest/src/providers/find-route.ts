// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {FindRoute} from '../internal-types';
import {HttpHandler} from '../http-handler';
import {RestBindings} from '../keys';

export class FindRouteProvider implements Provider<FindRoute> {
  constructor(
    @inject(RestBindings.Http.CONTEXT) protected context: Context,
    @inject(RestBindings.HANDLER) protected handler: HttpHandler,
  ) {}

  value(): FindRoute {
    return request => {
      const found = this.handler.findRoute(request);
      found.updateBindings(this.context);
      return found;
    };
  }
}
