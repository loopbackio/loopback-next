// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Typing system for LoopBack
 */
import {Options, Any} from '../common-types';
import * as util from 'util';

export {Any} from '../common-types';

export interface Type<T> {
  /**
   * Name of the type
   */
  name: string;

  /**
   * Test if the given value is an instance of this type
   * @param value The value
   */
  isInstance(value: Any): boolean;

  /**
   * Generate the default value for this type
   */
  defaultValue(): T|null|undefined;

  /**
   * Check if the given value can be coerced into this type
   * @param value The value to to be coerced
   * @returns {boolean}
   */
  isCoercible(value: Any, options?: Options): boolean;

  /**
   * Coerce the value into this type
   * @param value The value to be coerced
   * @param options Options for coercion
   * @returns Coerced value of this type
   */
  coerce(value: Any, options?: Options): T|null|undefined;

  /**
   * Serialize a value into json
   * @param value The value of this type
   * @param options Options for serialization
   */
  serialize(value: T|null|undefined, options?: Options): Any;
}

