// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/extension-logging
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {config, extensions, Getter, Provider} from '@loopback/core';
import {Format} from 'logform';
import {
  createLogger,
  format,
  Logger,
  LoggerOptions,
  transports as commonTransports,
} from 'winston';
import * as Transport from 'winston-transport';

export {Format, TransformableInfo} from 'logform';

export const WINSTON_TRANSPORT = 'logging.winston.transport';

export const WINSTON_FORMAT = 'logging.winston.format';

export class WinstonLoggerProvider implements Provider<Logger> {
  constructor(
    @extensions(WINSTON_TRANSPORT)
    private transports: Getter<Transport[]>,
    @extensions(WINSTON_FORMAT)
    private formats: Getter<Format[]>,
    @config() private options: LoggerOptions = {},
  ) {}

  async value() {
    let transports = await this.transports();
    if (transports.length === 0) {
      transports = [new commonTransports.Console({})];
    }
    const formats = await this.formats();
    return createLogger({
      transports,
      format: format.combine(...formats),
      ...this.options,
    });
  }
}
