// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider} from '@loopback/context';
import {BindElement} from '../internal-types';
import {RestBindings} from '../keys';

export class BindElementProvider implements Provider<BindElement> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}
  value(): BindElement {
    return (key: string) => this.context.bind(key);
  }
}
