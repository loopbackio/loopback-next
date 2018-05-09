// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context, inject, Provider, Binding} from '@loopback/context';
import {BindElement} from '../types';
import {RestBindings} from '../keys';

export class BindElementProvider implements Provider<BindElement> {
  constructor(@inject(RestBindings.Http.CONTEXT) protected context: Context) {}

  value(): BindElement {
    return key => this.action(key);
  }

  action(key: string): Binding {
    return this.context.bind(key);
  }
}
