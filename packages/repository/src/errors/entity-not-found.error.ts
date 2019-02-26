// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity} from '../model';

export class EntityNotFoundError<ID, Props extends object = {}> extends Error {
  code: string;
  entityName: string;
  entityId: ID;

  constructor(
    entityOrName: typeof Entity | string,
    entityId: ID,
    extraProperties?: Props,
  ) {
    const entityName =
      typeof entityOrName === 'string'
        ? entityOrName
        : entityOrName.modelName || entityOrName.name;

    const quotedId = JSON.stringify(entityId);

    super(`Entity not found: ${entityName} with id ${quotedId}`);

    Error.captureStackTrace(this, this.constructor);

    this.code = 'ENTITY_NOT_FOUND';
    this.entityName = entityName;
    this.entityId = entityId;

    Object.assign(this, extraProperties);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEntityNotFoundError(e: any): e is EntityNotFoundError<any> {
  return e instanceof EntityNotFoundError;
}
