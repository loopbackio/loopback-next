// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type} from './type';
import * as util from 'util';

// tslint:disable:no-any

/**
 * Array type, such as string[]
 */
export class ArrayType<T> implements Type<Array<T>> {
  constructor(public itemType: Type<T>) {}

  readonly name = 'array';

  isInstance(value: any) {
    if (value == null) return true;
    if (!Array.isArray(value)) {
      return false;
    }
    const list = value as Array<T | null | undefined>;
    return list.every(i => this.itemType.isInstance(i));
  }

  isCoercible(value: any): boolean {
    if (value == null) return true;
    if (!Array.isArray(value)) {
      return false;
    }
    return value.every(i => this.itemType.isCoercible(i));
  }

  defaultValue(): Array<T> {
    return [];
  }

  coerce(value: any) {
    if (value == null) return value;
    if (!Array.isArray(value)) {
      const msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return value.map(i => this.itemType.coerce(i));
  }

  serialize(value: Array<T> | null | undefined) {
    if (value == null) return value;
    return value.map(i => this.itemType.serialize(i));
  }
}
