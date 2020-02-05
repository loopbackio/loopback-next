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

/**
 * Re-export logform/winston types
 */
export {
  Format as WinstonFormat,
  TransformableInfo as WinstonLogRecord,
} from 'logform';
export {
  format,
  Logger as WinstonLogger,
  LoggerOptions as WinstonLoggerOptions,
  transports as WinstonTransports,
} from 'winston';

/**
 * An extension point for winston transports
 */
export const WINSTON_TRANSPORT = 'logging.winston.transport';

/**
 * An extension point for winston formats
 */
export const WINSTON_FORMAT = 'logging.winston.format';

/**
 * A provider class that creates WinstonLogger instances
 */
export class WinstonLoggerProvider implements Provider<Logger> {
  constructor(
    /**
     * Getter for transports
     */
    @extensions(WINSTON_TRANSPORT)
    private transports: Getter<Transport[]>,
    /**
     * Getter for formats
     */
    @extensions(WINSTON_FORMAT)
    private formats: Getter<Format[]>,
    /**
     * Configuration for the logger
     */
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
