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
 * Type alias for options object
 */
export interface Options {
  [property: string]: any,
};

