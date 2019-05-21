// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider, BoundValue} from '@loopback/context';
import {writeResultToResponse} from '../writer';
/**
 * Provides the function that populates the response object with
 * the results of the operation.
 *
 * @returns The handler function that will populate the
 * response with operation results.
 */
export class SendProvider implements Provider<BoundValue> {
  value() {
    return writeResultToResponse;
  }
}
