// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type, AnyType as Any} from './type';

/**
 * Any type
 */
export class AnyType implements Type<Any> {
  readonly name = 'any';

  isInstance(value: Any) {
    return true;
  }

  isCoercible(value: Any) {
    return true;
  }

  defaultValue(): Any {
    return undefined;
  }

  coerce(value: Any) {
    return value;
  }

  serialize(value: Any) {
    if (value && typeof value.toJSON === 'function') {
      return value.toJSON();
    }
    return value;
  }
}
