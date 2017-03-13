import * as util from 'util';
import {Type} from './type';

/**
 * Date type
 */
export class DateType implements Type<Date> {
  readonly name = 'date';

  isInstance(value: any) {
    return value == null || (value instanceof Date);
  }

  isCoercible(value: any): boolean {
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

  coerce(value: any) {
    if (value == null) return value;
    if (value instanceof Date) {
      return value;
    }
    let d = new Date(value);
    if (isNaN(d.getTime())) {
      let msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return d;
  }

  serialize(value: Date) {
    if (value == null) return value;
    return value.toJSON();
  }
}
