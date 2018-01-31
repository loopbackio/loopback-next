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
import * as debugModule from 'debug';
const debug = debugModule('loopback:example:extension:log');

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
      let msg = `${req.url} :: ${controllerClass.name}.`;
      msg += `${methodName}(${args.join(', ')}) => `;

      if (typeof result === 'object') msg += JSON.stringify(result);
      else msg += result;

      if (start) {
        const timeDiff: HighResTime = this.timer(start);
        const time: number =
          timeDiff[0] * 1000 + Math.round(timeDiff[1] * 1e-4) / 100;
        msg = `${time}ms: ${msg}`;
      }

      switch (level) {
        case LOG_LEVEL.DEBUG:
          this.log(chalk.white(`DEBUG: ${msg}`));
          break;
        case LOG_LEVEL.INFO:
          this.log(chalk.green(`INFO: ${msg}`));
          break;
        case LOG_LEVEL.WARN:
          this.log(chalk.yellow(`WARN: ${msg}`));
          break;
        case LOG_LEVEL.ERROR:
          this.log(chalk.red(`ERROR: ${msg}`));
          break;
      }
    }
  }

  log(msg: string) {
    debug(msg);
  }
}
