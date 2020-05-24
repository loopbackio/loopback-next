// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';
import {HttpHandler} from '../http-handler';
import {RestBindings} from '../keys';
import {FindRoute} from '../types';

export class FindRouteProvider {
  static value(
    @inject(RestBindings.Http.CONTEXT) context: Context,
    @inject(RestBindings.HANDLER) handler: HttpHandler,
  ): FindRoute {
    const findRoute: FindRoute = request => {
      const found = handler.findRoute(request);
      found.updateBindings(context);
      return found;
    };
    return findRoute;
  }
}
