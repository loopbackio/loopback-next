// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/authentication
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {AuthenticationBindings} from '../..';

export function givenContext() {
  const context: Context = new Context();
  context.bind(AuthenticationBindings.CURRENT_USER).toDeferred();
  return context;
}
