// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Class, AnyObject} from '../common-types';
import {Type} from './type';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Object type
 */
export class ObjectType<T extends AnyObject> implements Type<T> {
  name = 'object';

  constructor(public type: Class<T>) {}

  isInstance(value: any) {
    return value == null || value instanceof this.type;
  }

  isCoercible(value: any): boolean {
    return (
      value == null || (typeof value === 'object' && !Array.isArray(value))
    );
  }

  defaultValue() {
    return new this.type();
  }

  coerce(value: any) {
    if (value == null) return value;
    if (value instanceof this.type) {
      return value;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      const msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return new this.type(value);
  }

  serialize(value: T | null | undefined) {
    if (value == null) return value;
    if (typeof value.toJSON === 'function') {
      return value.toJSON();
    }
    return value;
  }
}
