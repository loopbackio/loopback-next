// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

declare function require(name:string): any;
var pino = require('pino');
var winston = require('winston');

import * as fs from 'fs';
import * as path from 'path';
import {Provider} from '../../../context';

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
export class PinoLoggerProvider implements Provider<Logger> {
  private logger: any;
  constructor() {
    let pinoLogger = new PinoLogger();
    console.log('~~~ Provider of pino logger started.');
    this.logger = pinoLogger.log;
  }
  value() {
    return this.logger;
  }
}

const logToFile = false;
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
    console.log('~~~ Pino logger started.');
  }
  get log() {
    return this.logger;
  }  
}

export class WinstonLoggerProvider implements Provider<Logger> {
  private logger: any;
  constructor() {
    let winstonLogger = new WinstonLogger();
    console.log('~~~ Provider of winston logger started');
    this.logger = winstonLogger.log;
  }
  value() {
    return this.logger;
  }
}

class WinstonLogger {
  logger: any;
  constructor() {
    this.logger = winston;
    console.log('~~~ Winston logger started.');
  }
  get log() {
    return this.logger;
  }
}
