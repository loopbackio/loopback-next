// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {FindRoute} from '../../internal-types';
import {HttpHandler} from '../../http-handler';
import {CoreBindings} from '../../keys';

export class FindRouteProvider implements Provider<FindRoute> {
  constructor(
    @inject(CoreBindings.Http.CONTEXT) protected context: Context,
    @inject(CoreBindings.HTTP_HANDLER) protected handler: HttpHandler) {}

  value(): FindRoute {
    return (request) => {
      const found = this.handler.findRoute(request);
      found.updateBindings(this.context);
      return found;
    };
  }
}

