// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type, AnyType} from './type';

/**
 * Boolean type
 */
export class BooleanType implements Type<boolean> {
  readonly name = 'boolean';

  isInstance(value: AnyType) {
    return value == null || typeof value === 'boolean';
  }

  defaultValue() {
    return false;
  }

  isCoercible(value: AnyType): boolean {
    return true;
  }

  coerce(value: AnyType) {
    return value == null ? value : Boolean(value);
  }

  serialize(value: boolean|null|undefined) {
    return value;
  }
}
