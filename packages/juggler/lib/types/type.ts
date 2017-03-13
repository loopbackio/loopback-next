/**
 * Typing system for LoopBack
 */

import * as util from 'util';

export interface Type<T> {
  /**
   * Name of the type
   */
  name: string;

  /**
   * Test if the given value is an instance of this type
   * @param value The value
   */
  isInstance(value: any): boolean;

  /**
   * Generate the default value for this type
   */
  defaultValue(): T;

  /**
   * Check if the given value can be coerced into this type
   * @param value The value to to be coerced
   * @returns {boolean}
   */
  isCoercible(value: any, options?: Object): boolean;

  /**
   * Coerce the value into this type
   * @param value The value to be coerced
   * @param options Options for coercion
   * @returns Coerced value of this type
   */
  coerce(value: any, options?: Object): T;

  /**
   * Serialize a value into json
   * @param value The value of this type
   * @param options Options for serialization
   */
  serialize(value: T, options?: Object): any;
}

