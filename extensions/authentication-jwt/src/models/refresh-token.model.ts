// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/authentication-jwt
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity, model, property} from '@loopback/repository';
import {User} from '.';

@model({settings: {strict: false}})
export class RefreshToken extends Entity {
  @property({
    type: 'number',
    id: 1,
    generated: true,
  })
  id: number;

  @belongsTo(() => User)
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  refreshToken: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<RefreshToken>) {
    super(data);
  }
}

export interface RefreshTokenRelations {
  // describe navigational properties here
}

export type RefereshTokenWithRelations = RefreshToken & RefreshTokenRelations;
