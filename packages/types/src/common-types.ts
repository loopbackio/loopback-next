// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Common types/interfaces such as Class/Constructor/Options/Callback
 */
// tslint:disable:no-any

/**
 * Interface for classes with `new` operator and static properties/methods
 */
export interface Class<T> {
  // new MyClass(...args) ==> T
  new (...args: any[]): T;
  // Other static properties/operations
  [property: string]: any;
}

/**
 * Interface for constructor functions without `new` operator, for example,
 * ```
 * function Foo(x) {
 *   if (!(this instanceof Foo)) { return new Foo(x); }
 *   this.x = x;
 * }
 * ```
 */
export interface ConstructorFunction<T> {
  (...args: any[]): T;
}

/**
 * Constructor type - class or function
 */
export type Constructor<T> = Class<T> | ConstructorFunction<T>;

/**
 * Objects with open properties
 */
export interface AnyObject {
  [property: string]: any;
}

export type Options = AnyObject | undefined;

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties
 * and sub-properties.
 */
export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};
