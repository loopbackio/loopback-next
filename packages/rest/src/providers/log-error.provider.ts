// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, BindingScope, Provider} from '@loopback/core';
import {LogError, Request} from '../types';

@bind({scope: BindingScope.SINGLETON})
export class LogErrorProvider implements Provider<LogError> {
  value(): LogError {
    return (err, statusCode, req) => this.action(err, statusCode, req);
  }

  action(err: Error, statusCode: number, req: Request) {
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
  }
}
