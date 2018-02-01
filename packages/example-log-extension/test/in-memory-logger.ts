// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {LOG_LEVEL} from '../';
import chalk from 'chalk';

export class InMemoryLog {
  private entries: string[] = [];

  add(msg?: string) {
    if (msg) this.entries.push(msg);
  }

  reset() {
    this.entries = [];
  }
}

export const inMemLog = new InMemoryLog();

export function logToMemory(msg: string, level: number) {
  let output;
  switch (level) {
    case LOG_LEVEL.DEBUG:
      output = chalk.white(`DEBUG: ${msg}`);
      break;
    case LOG_LEVEL.INFO:
      output = chalk.green(`INFO: ${msg}`);
      break;
    case LOG_LEVEL.WARN:
      output = chalk.yellow(`WARN: ${msg}`);
      break;
    case LOG_LEVEL.ERROR:
      output = chalk.red(`ERROR: ${msg}`);
      break;
  }
  inMemLog.add(output);
}

export function resetLogs() {
  inMemLog.reset();
}
