// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider, BoundValue} from '@loopback/context';
import {parseOperationArgs} from '../parser';
/**
 * Provides the function for parsing args in requests at runtime.
 *
 * @export
 * @class ParseParamsProvider
 * @implements {Provider<BoundValue>}
 * @returns {BoundValue} The handler function that will parse request args.
 */
export class ParseParamsProvider implements Provider<BoundValue> {
  value() {
    return parseOperationArgs;
  }
}
