// Copyright IBM Corp. 2013,2017. All Rights Reserved.
// Node module: @loopback/logger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

declare function require(name:string): any;
const pinoHttp = require('pino-http');
import {BindingKeys} from './keys';
import {Component, DefaultSequence, inject} from '../../core';
import {Provider} from '../../context';
import {Logger, PinoLoggerProvider, WinstonLoggerProvider} from './providers/LoggerProvider';
const providerKey = BindingKeys.System.LOGGER_PROVIDER;

export {BindingKeys} from './keys';
export {Logger} from './providers/LoggerProvider';

export class PinoLoggerComponent implements Component {
  // PinoLoggerProvider is bound to the key [providerKey]
  // in the client's application context.
  providers = {
    [providerKey]: PinoLoggerProvider,
  }
}

export class PinoHttpLoggerSequence extends DefaultSequence {
  private defaultHandle: Function;
  @inject(providerKey)
  private loggerProvider: Provider<Logger>;
  private httpLogger: any;
  constructor(a: any, b: any, c: any, d: any) {
    super(a, b, c, d);
    this.defaultHandle = super.handle;
  }
  async handle(req: any, res: any) {
    if (!this.httpLogger) {
      this.httpLogger = pinoHttp({
        logger: this.loggerProvider,
        genReqId: function(req: any) { return req.id },
      });
      console.log('~~~ PinoHttp logger initialized');
    }
    this.httpLogger(req, res);
    this.defaultHandle(req, res);
  }
}

export class WinstonLoggerComponent implements Component {
  providers = {
    [providerKey]: WinstonLoggerProvider,
  }
}
