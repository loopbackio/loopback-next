// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: loopback
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {controller, get} from 'metadata';

@controller()
export class LogController {
  @get
  public getLogs(): string[] {
    return [
      'status check ok',
      'hello world',
    ];
  }
}
