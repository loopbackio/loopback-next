// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type} from './type';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Null type
 */
export class NullType implements Type<null> {
  readonly name = 'boolean';

  isInstance(value: any) {
    return value === null;
  }

  defaultValue() {
    return null;
  }

  isCoercible(value: any): boolean {
    return value == null;
  }

  coerce(value: any) {
    return null;
  }

  serialize(value: boolean | null | undefined) {
    return null;
  }
}
