import {NumberType, StringType} from './handlers';

// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/types
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// tslint:disable-next-line:no-any
export function getSerializer(type: string) {
  if (type === 'number') {
    return new NumberType();
  }
  if (type === 'string') {
    return new StringType();
  }
  throw new Error('only numberType and stringType are implemented');
}
