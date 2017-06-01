// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/**
 * Typing system for LoopBack
 */
import {Options, AnyType} from '../common';
import * as util from 'util';

export {AnyType} from '../common';

export interface Type<T> {
  /**
   * Name of the type
   */
  name: string;

  /**
   * Test if the given value is an instance of this type
   * @param value The value
   */
  isInstance(value: AnyType): boolean;

  /**
   * Generate the default value for this type
   */
  defaultValue(): T|null|undefined;

  /**
   * Check if the given value can be coerced into this type
   * @param value The value to to be coerced
   * @returns {boolean}
   */
  isCoercible(value: AnyType, options?: Options): boolean;

  /**
   * Coerce the value into this type
   * @param value The value to be coerced
   * @param options Options for coercion
   * @returns Coerced value of this type
   */
  coerce(value: AnyType, options?: Options): T|null|undefined;

  /**
   * Serialize a value into json
   * @param value The value of this type
   * @param options Options for serialization
   */
  serialize(value: T|null|undefined, options?: Options): AnyType;
}

