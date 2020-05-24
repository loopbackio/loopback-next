// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LogError} from '../types';

export class LogErrorProvider {
  static value(): LogError {
    const logError: LogError = (err, statusCode, req) => {
      if (statusCode < 500) {
        return;
      }

      console.error(
        'Unhandled error in %s %s: %s %s',
        req.method,
        req.url,
        statusCode,
        err.stack ?? err,
      );
    };
    return logError;
  }
}
