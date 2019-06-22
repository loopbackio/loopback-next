// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {RelationType, RelationMetadata} from '../relations';

export class InvalidRelationError<Props extends object = {}> extends Error {
  code: string;
  reason: string;
  relationName: string;
  relationType: RelationType;
  sourceModelName: string;

  constructor(
    reason: string,
    relationMeta: RelationMetadata,
    extraProperties?: Props,
  ) {
    const {name, type, source} = relationMeta;
    const model = (source && source.modelName) || '<Unknown Model>';
    const message = `Invalid ${type} definition for ${model}#${name}: ${reason}`;
    super(message);

    Error.captureStackTrace(this, this.constructor);

    this.code = 'INVALID_RELATION_DEFINITION';
    this.relationName = name;
    this.relationType = type;
    this.sourceModelName = model;

    Object.assign(this, extraProperties);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInvalidRelationError(e: any): e is InvalidRelationError<any> {
  return e instanceof InvalidRelationError;
}
