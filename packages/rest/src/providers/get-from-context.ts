// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {GetFromContext} from '../internal-types';
import {RestBindings} from '../keys';

export class GetFromContextProvider implements Provider<GetFromContext> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}

  value() {
    return (key: string) => this.context.get(key);
  }
}
