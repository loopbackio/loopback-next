// Copyright IBM Corp. and LoopBack contributors 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type} from './type';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * String type
 */
export class StringType implements Type<string> {
  readonly name = 'string';

  isInstance(value: any): boolean {
    return value == null || typeof value === 'string';
  }

  isCoercible(value: any): boolean {
    return true;
  }

  defaultValue(): string {
    return '';
  }

  coerce(value: any): string {
    if (value == null) return value;
    if (typeof value.toJSON === 'function') {
      value = value.toJSON();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  serialize(value: string | null | undefined) {
    return value;
  }
}
