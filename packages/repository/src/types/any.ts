// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Type} from './type';

// tslint:disable:no-any

/**
 * Any type
 */
export class AnyType implements Type<any> {
  readonly name = 'any';

  isInstance(value: any) {
    return true;
  }

  isCoercible(value: any) {
    return true;
  }

  defaultValue(): any {
    return undefined;
  }

  coerce(value: any) {
    return value;
  }

  serialize(value: any) {
    if (value && typeof value.toJSON === 'function') {
      return value.toJSON();
    }
    return value;
  }
}
