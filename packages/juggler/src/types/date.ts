// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: juggler
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Type, AnyType} from './type';

/**
 * Date type
 */
export class DateType implements Type<Date> {
  readonly name = 'date';

  isInstance(value: AnyType) {
    return value == null || (value instanceof Date);
  }

  isCoercible(value: AnyType): boolean {
    // Please note new Date(...) allows the following
    /*
     > new Date('1')
     2001-01-01T08:00:00.000Z
     > new Date('0')
     2000-01-01T08:00:00.000Z
     > new Date(1)
     1970-01-01T00:00:00.001Z
     > new Date(0)
     1970-01-01T00:00:00.000Z
     > new Date(true)
     1970-01-01T00:00:00.001Z
     > new Date(false)
     1970-01-01T00:00:00.000Z
     */
    return value == null || !isNaN(new Date(value).getTime());
  }

  defaultValue() {
    return new Date();
  }

  coerce(value: AnyType) {
    if (value == null) return value;
    if (value instanceof Date) {
      return value;
    }
    const d = new Date(value);
    if (isNaN(d.getTime())) {
      const msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return d;
  }

  serialize(value: Date|null|undefined) {
    if (value == null) return value;
    return value.toJSON();
  }
}
