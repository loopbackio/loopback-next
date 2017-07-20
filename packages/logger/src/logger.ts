// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

declare function require(name:string): any;
const bunyan = require('bunyan');
const finalhandler = require('finalhandler');
const fs = require('fs');
const morgan = require('morgan');
const path = require('path');

import {Application} from '../../core';
import {ServerRequest, ServerResponse} from 'http';

const logPath = path.join(process.cwd(), 'LoopBackNext.log');

export interface LoggingOptions {
  http?: boolean;
}

interface MorganFormatFn {
  (req: ServerRequest, res: ServerResponse, options?: any): string;
}

interface MorganTokens {
  date: MorganFormatFn;
  url: MorganFormatFn;
  method: MorganFormatFn;
  status: MorganFormatFn;
  'http-version': MorganFormatFn;
  'user-agent': MorganFormatFn;
  referrer: MorganFormatFn;
  'response-time': MorganFormatFn;
}

// {"name":"loopbackLogger","hostname":"tsetombp.usca.ibm.com","pid":21089,"level":30,"msg":"*** bunyan logger started.","time":"2017-07-06T19:52:40.267Z","v":0}
function formatMorgan(tokens: MorganTokens, req: ServerRequest, res: ServerResponse): string {
  const data = {
    name: 'morganHTTP',
    responseTime: tokens['response-time'](req, res),
    url: tokens.url(req, res),
    method: tokens.method(req, res),
    status: tokens.status(req, res),
    httpVersion: tokens['http-version'](req, res),
    userAgent: tokens['user-agent'](req, res),
    referrer: tokens.referrer(req, res),
    time: tokens.date(req, res, 'iso'),
    pid: process.pid,
  };
  return JSON.stringify(data, null, 2);  
}

export class Logger {
  private logger: any;
  constructor(app: Application, options?: LoggingOptions) {
    const logStream = fs.createWriteStream(logPath, {flags: 'a'});
    this.logger = bunyan.createLogger({name: 'bunyanLOGGER',
      streams: [{
        stream: logStream,
      }]
    });
    if (options.http) {
      const morganLogger = morgan(formatMorgan, {stream: logStream});
      const handleHttpOrig =  app.handleHttp;
      app.handleHttp = function(req: ServerRequest, res: ServerResponse): Promise<void> {
        return morganLogger(req, res, function (err: Object) {
          if (err) {
            this.logger.error(err);
            return finalhandler(req, res)(err);
          }
          return handleHttpOrig(req, res);
        });
      };
    }
    this.logger.info('*** LoopBack.Next Logger started.');
  }
  get log() {
    return this.logger;
  }  
}
