// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

declare function require(name:string): any;
var pino = require('pino');

import * as fs from 'fs';
import * as path from 'path';
import {Constructor, Provider} from '../../../context';
import {ServerRequest, ServerResponse} from 'http';


/**
 * @description Type definition of an instance of logger implementation
 * @example
 * bunyan: https://www.npmjs.com/package/bunyan
 * winston: https://www.npmjs.com/package/winston
 */
export type Logger = any;

/**
 * @description Provider of a logger
 */
export class LoggerProvider implements Provider<Logger> {
  private logger: any;
  constructor(logger?: Logger) {
    if (!logger) {
      let pinoLogger = new PinoLogger();
      logger = pinoLogger.log;
    }
    this.logger = logger;
  }
  value() {
    return this.logger;
  }
}

const logToFile = true;
const logPath = path.join(process.cwd(), 'LoopBackNext.log');

class PinoLogger {
  logger: any;
  constructor() {
    this.logger = pino({
      name: 'pinoLOGGER',
      safe: true,
      timestamp: pino.stdTimeFunctions.slowTime,
      serializers: {
        req: pino.stdSerializers.req,
        res: pino.stdSerializers.res
        }
      }, logToFile ? fs.createWriteStream(logPath, {flags: 'a'}) :
        pino.pretty({forceColor: true}).pipe(process.stdout));
    this.logger.info('*** LoopBack.Next Logger started.');
  }
  get log() {
    return this.logger;
  }  
}
