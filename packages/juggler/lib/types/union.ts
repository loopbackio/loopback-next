import * as util from 'util';
import {Type} from './type';

/**
 * Union type, such as string | number
 */
export class UnionType implements Type<any> {
  constructor(public itemTypes: Type<any>[]) {
  }

  readonly name = 'union';

  isInstance(value: any) {
    return this.itemTypes.some((t) => t.isInstance(value));
  }

  isCoercible(value: any) {
    return this.itemTypes.some((t) => t.isCoercible(value));
  }

  defaultValue() {
    return this.itemTypes[0].defaultValue();
  }

  coerce(value: any) {
    // First find instances
    for (let type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.coerce(value);
      }
    }
    // Try coercible
    for (let type of this.itemTypes) {
      if (type.isCoercible(value)) {
        return type.coerce(value);
      }
    }
    let msg = util.format('Invalid %s: %j', this.name, value);
    throw new TypeError(msg);
  }

  serialize(value: any) {
    for (let type of this.itemTypes) {
      if (type.isInstance(value)) {
        return type.serialize(value);
      }
    }
  }
}
