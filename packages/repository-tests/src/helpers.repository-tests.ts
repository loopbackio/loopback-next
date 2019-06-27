// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {CrudTestContext} from './types.repository-tests';

/**
 * Obtain CrudTestContext from the Mocha context.
 * @internal
 * @param context - Mocha context as provided to the test function via `this`.
 */
export function getCrudContext(context: Mocha.Context) {
  return (context as unknown) as CrudTestContext;
}

/**
 * Convert a function accepting context in the first argument into a regular
 * Mocha function.
 * @param fn - A Mocha function (describe/it/before/after callback) accepting
 * `CrudTestContext` as the regular argument.
 */
export function withCrudCtx(
  fn: (context: CrudTestContext) => PromiseLike<unknown> | void,
): Mocha.AsyncFunc | Mocha.Func {
  return function(this: Mocha.Context) {
    // See https://github.com/typescript-eslint/typescript-eslint/issues/604
    // eslint-disable-next-line no-invalid-this
    return fn.call(this, getCrudContext(this));
  };
}
