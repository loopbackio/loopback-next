import * as util from 'util';
import {Type} from './type';

/**
 * Number type
 */
export class NumberType implements Type<number> {
  readonly name = 'number';

  isInstance(value: any) {
    return value == null || (!isNaN(value) && (typeof value === 'number'));
  }

  isCoercible(value: any): boolean {
    return value == null || !isNaN(Number(value));
  }

  defaultValue() {
    return 0;
  }

  coerce(value: any) {
    if (value == null) return value;
    let n = Number(value);
    if (isNaN(n)) {
      let msg = util.format('Invalid %s: %j', this.name, value);
      throw new TypeError(msg);
    }
    return n;
  }

  serialize(value: number) {
    return value;
  }
}
