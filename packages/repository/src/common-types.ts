// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Common types/interfaces such as Class/Constructor/Options/Callback
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
 * Interface for constructor functions without `new` operator.
 *
 * @example
 * ```ts
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

/**
 * An extension of the built-in Partial<T> type which allows partial values
 * in deeply nested properties too.
 */
export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

/**
 * Type alias for strongly or weakly typed objects of T
 */
export type DataObject<T extends object> = T | DeepPartial<T>;

/**
 * Type alias for Node.js options object
 */
export type Options = AnyObject;

/**
 * Type alias for Node.js callback functions
 */
export type Callback<T> = (
  err: Error | string | null | undefined,
  result?: T,
) => void;

/**
 * Type for a command
 */
export type Command = string | AnyObject;

/**
 * Named parameters, such as `{x: 1, y: 'a'}`
 */
export type NamedParameters = AnyObject;

/**
 * Positional parameters, such as [1, 'a']
 */
export type PositionalParameters = any[];

/**
 * Count of Model instances that were successful for methods like `updateAll`,
 * `deleteAll`, etc.
 */
export interface Count {
  count: number;
}

/**
 * JSON Schema describing the Count interface. It's the response type for
 * REST calls to APIs which return Count
 */
export const CountSchema = {
  type: 'object',
  properties: {count: {type: 'number'}},
};
