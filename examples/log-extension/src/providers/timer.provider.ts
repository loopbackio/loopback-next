// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Provider} from '@loopback/core';
import {TimerFn, HighResTime} from '../types';

export class TimerProvider implements Provider<TimerFn> {
  constructor() {}

  value(): TimerFn {
    return (start?: HighResTime): HighResTime => {
      if (!start) return process.hrtime();
      return process.hrtime(start);
    };
  }
}
