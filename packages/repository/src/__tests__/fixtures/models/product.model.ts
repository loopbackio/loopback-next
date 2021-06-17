// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '../../..';

@model()
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    description: 'The unique identifier for a product',
  })
  id: number;

  @property({type: 'string'})
  name: string;

  @property({type: 'string'})
  slug: string;

  @property({
    type: 'date',
  })
  createdAt: Date;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
