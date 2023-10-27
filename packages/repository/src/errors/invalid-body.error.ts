// Copyright IBM Corp. and LoopBack contributors 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../model';

export class InvalidBodyError<ID, Props extends object = {}> extends Error {
  code: string;
  entityName: string;
  entityId: ID;
  statusCode: number;

  constructor(
    entityOrName: typeof Entity | string,
    entityId: ID,
    extraProperties?: Props,
  ) {
    const entityName =
      typeof entityOrName === 'string'
        ? entityOrName
        : entityOrName.modelName || entityOrName.name;

    super('Data is required for the patch request');

    Error.captureStackTrace(this, this.constructor);

    this.code = 'INVALID_BODY_DEFINITION';
    this.statusCode = 400;
    this.entityName = entityName;
    this.entityId = entityId;

    Object.assign(this, extraProperties);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInvalidBodyError(e: any): e is InvalidBodyError<any> {
  return e instanceof InvalidBodyError;
}
