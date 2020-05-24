// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject} from '@loopback/context';
import {RestBindings} from '../keys';
import {InvokeMethod} from '../types';

export class InvokeMethodProvider {
  static value(
    @inject(RestBindings.Http.CONTEXT) context: Context,
  ): InvokeMethod {
    const invokeMethod: InvokeMethod = (route, args) =>
      route.invokeHandler(context, args);
    return invokeMethod;
  }
}
