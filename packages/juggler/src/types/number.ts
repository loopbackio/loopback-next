// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Type, AnyType} from './type';

/**
 * Number type
 */
export class NumberType implements Type<number> {
  readonly name = 'number';

  isInstance(value: AnyType) {
    return value == null || (!isNaN(value) && (typeof value === 'number'));
  }

  isCoercible(value: AnyType): boolean {
    return value == null || !isNaN(Number(value));
  }

  defaultValue() {
    return 0;
  }

  coerce(value: AnyType) {
    if (value == null) return value;
    const n = Number(value);
    if (isNaN(n)) {
      const msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return n;
  }

  serialize(value: number|null|undefined) {
    return value;
  }
}
