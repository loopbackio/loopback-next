// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Component,
  ContextTags,
  createBindingFromClass,
} from '@loopback/core';
import {AuthorizationInterceptor} from './authorize-interceptor';
import {AuthorizationBindings} from './keys';

@bind({tags: {[ContextTags.KEY]: AuthorizationBindings.COMPONENT.key}})
export class AuthorizationComponent implements Component {
  bindings = [createBindingFromClass(AuthorizationInterceptor)];
}
