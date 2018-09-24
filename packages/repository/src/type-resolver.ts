// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Class} from './common-types';

/**
 * A function that resolves to a class/entity
 * Intended to be used for cases when the JS engine is unable to fully define
 * a given type (require() loops).
 */
export type TypeResolver<T extends Object> = () => Class<T>;

/**
 * A function that checks whether a function is a TypeResolver or not.
 * @param fn The value to check.
 */
export function isTypeResolver<T extends Object>(
  // tslint:disable-next-line:no-any
  fn: any,
): fn is TypeResolver<T> {
  // 1. A type provider must be a function
  if (typeof fn !== 'function') return false;

  // 2. A class constructor is not a type provider
  if (/^class/.test(fn.toString())) return false;

  // 3. Built-in types like Date & Array are not type providers
  if (isBuiltinType(fn)) return false;

  // TODO(bajtos): support model classes defined via ES5 constructor function

  return true;
}

/**
 * Check if the provided function is a built-in type provided by JavaScript
 * and/or Node.js. E.g. `Number`, `Array`, `Buffer`, etc.
 */
export function isBuiltinType(fn: Function): boolean {
  return (
    // scalars
    fn === Number ||
    fn === Boolean ||
    fn === String ||
    // objects
    fn === Object ||
    fn === Array ||
    fn === Date ||
    fn === RegExp ||
    fn === Buffer ||
    // function as a type
    fn === Function
  );
}

/**
 * Resolve a type value that may have been provided via TypeResolver.
 * @param fn A type class or a type provider.
 * @returns The resolved type.
 */
export function resolveType<T extends Object>(
  fn: TypeResolver<T> | Class<T>,
): Class<T>;

// An overload to handle the case when `fn` is not a class nor a resolver.
export function resolveType<T>(fn: T): T;

export function resolveType<T>(fn: TypeResolver<T> | Class<T>) {
  return isTypeResolver(fn) ? fn() : fn;
}
