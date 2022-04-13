// Copyright IBM Corp. and LoopBack contributors 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import util from 'util';
import {Options} from '../common-types';
import {Type} from './type';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

  coerce(value: any, options?: Options) {
    if (value == null) return value;
    if (Buffer.isBuffer(value)) return value as Buffer;
    if (typeof value === 'string') {
      options = options ?? {};
      const encoding = options.encoding || 'utf-8';
      return Buffer.from(value, encoding);
    } else if (Array.isArray(value)) {
      return Buffer.from(value);
    }
    const msg = util.format('Invalid %s: %j', this.name, value);
    throw new TypeError(msg);
  }

  serialize(value: Buffer | null | undefined, options?: Options) {
    if (value == null) return value;
    const encoding = options?.encoding || 'base64';
    return value.toString(encoding);
  }
}
