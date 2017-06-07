// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Type, Any} from './type';

/**
 * Union type, such as string | number
 */
export class UnionType implements Type<Any> {
  constructor(public itemTypes: Type<Any>[]) {
  }

  readonly name = 'union';

  isInstance(value: Any) {
    return this.itemTypes.some((t) => t.isInstance(value));
  }

  isCoercible(value: Any) {
    return this.itemTypes.some((t) => t.isCoercible(value));
  }

  defaultValue() {
    return this.itemTypes[0].defaultValue();
  }

  coerce(value: Any) {
    // First find instances
    for (const type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.coerce(value);
      }
    }
    // Try coercible
    for (const type of this.itemTypes) {
      if (type.isCoercible(value)) {
        return type.coerce(value);
      }
    }
    const msg = util.format('Invalid %s: %j', this.name, value);
    throw new TypeError(msg);
  }

  serialize(value: Any) {
    for (const type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.serialize(value);
      }
    }
  }
}
