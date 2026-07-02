// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../model';

export class DatabaseDriverError extends Error {
  code: string;
  statusCode: number;
  entityName: string;
  nativeCode: string | number;

  constructor(
    entityOrName: typeof Entity | string,
    message: string,
    options: {
      code: string;
      statusCode: number;
      nativeCode: string | number;
    },
  ) {
    const entityName =
      typeof entityOrName === 'string'
        ? entityOrName
        : entityOrName.modelName || entityOrName.name;

    super(message);

    this.name = 'DatabaseDriverError';
    this.entityName = entityName;
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.nativeCode = options.nativeCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDatabaseDriverError(e: any): e is DatabaseDriverError {
  return e instanceof DatabaseDriverError;
}
