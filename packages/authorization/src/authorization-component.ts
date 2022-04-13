// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/authorization
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Binding,
  Component,
  ContextTags,
  createBindingFromClass,
  injectable,
} from '@loopback/core';
import {AuthorizationInterceptor} from './authorize-interceptor';
import {AuthorizationBindings} from './keys';

@injectable({tags: {[ContextTags.KEY]: AuthorizationBindings.COMPONENT.key}})
export class AuthorizationComponent implements Component {
  bindings: Binding[] = [createBindingFromClass(AuthorizationInterceptor)];
}
