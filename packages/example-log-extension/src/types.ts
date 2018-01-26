// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

// Types and interfaces exposed by the extension go here

import {ParsedRequest, OperationArgs} from '@loopback/rest';

export interface LogFn {
  (
    req: ParsedRequest,
    args: OperationArgs,
    // tslint:disable-next-line:no-any
    result: any,
    startTime?: HighResTime,
  ): Promise<void>;

  startTimer(): HighResTime;
}

export type LevelMetadata = {level: number};

export type HighResTime = [number, number]; // [seconds, nanoseconds]

export type TimerFn = (start?: HighResTime) => HighResTime;
