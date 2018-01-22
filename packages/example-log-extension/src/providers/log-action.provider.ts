// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-log-extension
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {inject, Provider, Constructor, Getter} from '@loopback/context';
import {CoreBindings} from '@loopback/core';
import {OperationArgs, ParsedRequest} from '@loopback/rest';
import {getLogMetadata} from '../decorators/log.decorator';
import {EXAMPLE_LOG_BINDINGS, LOG_LEVEL} from '../keys';
import {LogFn, TimerFn, HighResTime, LevelMetadata} from '../types';
import chalk from 'chalk';

export class LogActionProvider implements Provider<LogFn> {
  constructor(
    @inject.getter(CoreBindings.CONTROLLER_CLASS)
    private readonly getController: Getter<Constructor<{}>>,
    @inject.getter(CoreBindings.CONTROLLER_METHOD_NAME)
    private readonly getMethod: Getter<string>,
    @inject(EXAMPLE_LOG_BINDINGS.APP_LOG_LEVEL)
    private readonly logLevel: number,
    @inject(EXAMPLE_LOG_BINDINGS.TIMER) public timer: TimerFn,
  ) {}

  value(): LogFn {
    const fn = <LogFn>((
      req: ParsedRequest,
      args: OperationArgs,
      // tslint:disable-next-line:no-any
      result: any,
      start?: HighResTime,
    ) => {
      return this.action(req, args, result, start);
    });

    fn.startTimer = () => {
      return this.timer();
    };

    return fn;
  }

  private async action(
    req: ParsedRequest,
    args: OperationArgs,
    // tslint:disable-next-line:no-any
    result: any,
    start?: HighResTime,
  ): Promise<void> {
    const controllerClass = await this.getController();
    const methodName: string = await this.getMethod();

    const metadata: LevelMetadata = getLogMetadata(controllerClass, methodName);
    const level: number | undefined = metadata ? metadata.level : undefined;

    if (
      level !== undefined &&
      this.logLevel !== LOG_LEVEL.OFF &&
      level >= this.logLevel &&
      level !== LOG_LEVEL.OFF
    ) {
      if (!args) args = [];
      let log = `${req.url} :: ${controllerClass.name}.`;
      log += `${methodName}(${args.join(', ')}) => `;

      if (typeof result === 'object') log += JSON.stringify(result);
      else log += result;

      if (start) {
        const timeDiff: HighResTime = this.timer(start);
        const time: number =
          timeDiff[0] * 1000 + Math.round(timeDiff[1] * 1e-4) / 100;
        log = `${time}ms: ${log}`;
      }

      switch (level) {
        case LOG_LEVEL.DEBUG:
          console.log(chalk.white(`DEBUG: ${log}`));
          break;
        case LOG_LEVEL.INFO:
          console.log(chalk.green(`INFO: ${log}`));
          break;
        case LOG_LEVEL.WARN:
          console.log(chalk.yellow(`WARN: ${log}`));
          break;
        case LOG_LEVEL.ERROR:
          console.log(chalk.red(`ERROR: ${log}`));
          break;
      }
    }
  }
}
