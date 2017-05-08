/**
 * Common types/interfaces such as Class/Constructor/Options/Callback
 */

/**
 * A interface for classes
 */
export interface Class<T> {
  new (...args: any[]): T
}

/**
 * Constructor type - class or function
 */
export type Constructor<T> = Class<T> | ((...args: any[]) => T);

/**
 * Objects with open properties
 */
export interface AnyObject {
  [property: string]: any,
};

export type ObjectType<T> = T|AnyObject;

/**
 * Type alias for options object
 */
export type Options = AnyObject|null|undefined;

/**
 * Type alias for Node.js callback functions
 */
export type Callback<T> = (err:Error|string|null|undefined, result:T) => void;

