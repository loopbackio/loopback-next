// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/example-access-control-migration
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Team extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: false,
  })
  id: number;

  @property({
    type: 'number',
    required: true,
  })
  ownerId: number;

  // REFACTOR
  // The members should be specified by relation
  // instead of using an array of Ids
  @property({
    type: 'array',
    itemType: 'number',
    required: true,
  })
  memberIds: number[];

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Team>) {
    super(data);
  }
}

export interface TeamRelations {
  // describe navigational properties here
}

export type TeamWithRelations = Team & TeamRelations;
