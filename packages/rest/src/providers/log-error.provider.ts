// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {BindingScope, injectable, Provider} from '@loopback/core';
import {LogError, Request} from '../types';

@injectable({scope: BindingScope.SINGLETON})
export class LogErrorProvider implements Provider<LogError> {
  value(): LogError {
    return (err, statusCode, req) => this.action(err, statusCode, req);
  }

  action(err: Error, statusCode: number, req: Request) {
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
  }
}
