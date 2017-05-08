/**
 * Common types/interfaces such as Class/Constructor/Options/Callback
 */

/**
 * Interface for classes with `new` operator
 */
export interface Class<T> {
  new (...args: any[]): T
}

/**
 * Interface for constructor functions without `new` operator
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
  [property: string]: any,
};

export type ObjectType<T> = T | AnyObject;

/**
 * Type alias for Node.js options object
 */
export type Options = AnyObject | null | undefined;

/**
 * Type alias for Node.js callback functions
 */
export type Callback<T> =
  (err: Error | string | null | undefined, result: T) => void;

