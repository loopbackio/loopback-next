// Copyright IBM Corp. and LoopBack contributors 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, injectable} from '@loopback/core';
import {LogError} from '../types';

@injectable({scope: BindingScope.SINGLETON})
export class LogErrorProvider {
  static value(): LogError {
    const logError: LogError = (err, statusCode, req) => {
      if (statusCode < 500) {
        return;
      }

      console.error(
        'Request %s %s failed with status code %s. %s',
        req.method,
        req.url,
        statusCode,
        err.stack ?? err,
      );
    };
    return logError;
  }
}
