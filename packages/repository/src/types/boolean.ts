// Copyright IBM Corp. 2017,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type} from './type';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Boolean type
 */
export class BooleanType implements Type<boolean> {
  readonly name = 'boolean';

  isInstance(value: any) {
    return value == null || typeof value === 'boolean';
  }

  defaultValue() {
    return false;
  }

  isCoercible(value: any): boolean {
    return true;
  }

  coerce(value: any) {
    return value == null ? value : Boolean(value);
  }

  serialize(value: boolean | null | undefined) {
    return value;
  }
}
