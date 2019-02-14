// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/express-middleware
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  bind,
  Binding,
  BindingFilter,
  BindingScope,
  BindingSpec,
  BindingTemplate,
  filterByTag,
} from '@loopback/context';
import {MiddlewareSpec} from './types';

/**
 * Configure the binding as express middleware
 * @param binding - Binding
 */
export function asMiddlewareBinding(
  spec?: MiddlewareSpec,
): BindingTemplate<unknown> {
  const tags = Object.assign({}, spec);
  return (binding: Binding<unknown>) => {
    return binding
      .tag('middleware')
      .inScope(BindingScope.SINGLETON)
      .tag(tags);
  };
}

/**
 * A sugar `@middleware` decorator to simplify `@bind` for middleware classes
 * @param spec - Middleware spec
 */
export function middleware(spec?: MiddlewareSpec, ...specs: BindingSpec[]) {
  return bind({tags: spec}, asMiddlewareBinding(spec), ...specs);
}

/**
 * A filter function to find all middleware bindings
 */
export const middlewareFilter: BindingFilter = filterByTag('middleware');
