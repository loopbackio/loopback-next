// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Common types/interfaces such as Class/Constructor/Options/Callback
 */
// tslint:disable-next-line:no-any
export type AnyType = any;

/**
 * Interface for classes with `new` operator and static properties/methods
 */
export interface Class<T> {
  // new MyClass(...args) ==> T
  new (...args: AnyType[]): T;
  // Other static properties/operations
  [property: string]: AnyType;
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
  (...args: AnyType[]): T;
}

/**
 * Constructor type - class or function
 */
export type Constructor<T> = Class<T> | ConstructorFunction<T>;

/**
 * Objects with open properties
 */
export interface AnyObject {
  [property: string]: AnyType;
}

export type ObjectType<T> = T | AnyObject;

/**
 * Type alias for Node.js options object
 */
export type Options = AnyObject | null | undefined;

/**
 * Type alias for Node.js callback functions
 */
export type Callback<T> =
  (err: Error | string | null | undefined, result?: T) => void;

