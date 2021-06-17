// Copyright The LoopBack Authors 2020,2021. All Rights Reserved.
// Node module: @loopback/cli
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model()
export class IdModel extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: string;

  constructor(data?: Partial<IdModel>) {
    super(data);
  }
}
