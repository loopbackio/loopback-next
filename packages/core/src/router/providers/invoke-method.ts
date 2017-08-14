// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/core
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {InvokeMethod} from '../../internal-types';
import {CoreBindings} from '../../keys';

export class InvokeMethodProvider implements Provider<InvokeMethod> {
  constructor(@inject(CoreBindings.Http.CONTEXT) protected context: Context) {}

  value(): InvokeMethod {
    return async (route, args) => {
      return await route.invokeHandler(this.context, args);
    };
  }
}
