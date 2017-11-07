// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BoundValue, Provider} from '@loopback/context';
import {ServerRequest} from '../';

export class LogErrorProvider implements Provider<BoundValue> {
  value() {
    return (err: Error, statusCode: number, req: ServerRequest) => {
      if (statusCode >= 500) {
        console.error(
          'Unhandled error in %s %s: %s %s',
          req.method,
          req.url,
          statusCode,
          err.stack || err,
        );
      }
    };
  }
}
