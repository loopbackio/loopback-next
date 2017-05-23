// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type, AnyType} from './type';

/**
 * Array type, such as string[]
 */
export class ArrayType<T> implements Type<Array<T>> {
  constructor(public itemType: Type<T>) {
  }

  readonly name = 'array';

  isInstance(value: AnyType) {
    if (!Array.isArray(value)) {
      return false;
    }
    const list = value as Array<T|null|undefined>;
    return list.every((i) => this.itemType.isInstance(i));
  }

  isCoercible(value: AnyType): boolean {
    if (!Array.isArray(value)) {
      return false;
    }
    return value.every((i) => this.itemType.isCoercible(i));
  }

  defaultValue(): Array<T> {
    return [];
  }

  coerce(value: AnyType) {
    return value;
  }

  serialize(value: Array<T>|null|undefined) {
    if (value == null) return value;
    return value.map((i) => this.itemType.serialize(i));
  }
}
