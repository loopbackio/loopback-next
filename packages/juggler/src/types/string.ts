// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type, AnyType} from './type';

/**
 * String type
 */
export class StringType implements Type<string> {
  readonly name = 'string';

  isInstance(value: AnyType): boolean {
    return value == null || typeof value === 'string';
  }

  isCoercible(value: AnyType): boolean {
    return true;
  }

  defaultValue(): string {
    return '';
  }

  coerce(value: AnyType): string {
    if (value == null) return value;
    if (typeof value.toJSON === 'function') {
      value = value.toJSON();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  serialize(value: string|null|undefined) {
    return value;
  }
}
