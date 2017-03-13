import * as util from 'util';
import {Type} from './type';

/**
 * Buffer (binary) type
 */
export class BufferType implements Type<Buffer> {
  readonly name = 'buffer';

  isInstance(value: any) {
    return value == null || Buffer.isBuffer(value);
  }

  defaultValue() {
    return Buffer.from([]);
  }

  isCoercible(value: any): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return true;
    if (Buffer.isBuffer(value)) return true;
    if (Array.isArray(value)) return true;
    return false;
  }

  coerce(value: any, options) {
    if (value == null) return value;
    if (Buffer.isBuffer(value)) return value as Buffer;
    if (typeof value === 'string') {
      options = options || {};
      let encoding = options.encoding || 'utf-8';
      return Buffer.from(value as string, encoding);
    } else if (Array.isArray(value)) {
      return Buffer.from(value as Array<any>);
    }
    let msg = util.format('Invalid %s: %j', this.name, value);
    throw new TypeError(msg);
  }

  serialize(value: Buffer, options) {
    if (value == null) return value;
    let encoding = options.encoding || 'base64';
    return value.toString(encoding);
  }
}
