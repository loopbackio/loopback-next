// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as util from 'util';
import {Type, AnyType} from './type';
import {Options} from '../common';

/**
 * Buffer (binary) type
 */
export class BufferType implements Type<Buffer> {
  readonly name = 'buffer';

  isInstance(value: AnyType) {
    return value == null || Buffer.isBuffer(value);
  }

  defaultValue() {
    return Buffer.from([]);
  }

  isCoercible(value: AnyType): boolean {
    if (value == null) return true;
    if (typeof value === 'string') return true;
    if (Buffer.isBuffer(value)) return true;
    if (Array.isArray(value)) return true;
    return false;
  }

  coerce(value: AnyType, options?: Options) {
    if (value == null) return value;
    if (Buffer.isBuffer(value)) return value as Buffer;
    if (typeof value === 'string') {
      options = options || {};
      const encoding = options.encoding || 'utf-8';
      return Buffer.from(value as string, encoding);
    } else if (Array.isArray(value)) {
      return Buffer.from(value as Array<AnyType>);
    }
    const msg = util.format('Invalid %s: %j', this.name, value);
    throw new TypeError(msg);
  }

  serialize(value: Buffer|null|undefined, options?: Options) {
    if (value == null) return value;
    const encoding = options && options.encoding || 'base64';
    return value.toString(encoding);
  }
}
