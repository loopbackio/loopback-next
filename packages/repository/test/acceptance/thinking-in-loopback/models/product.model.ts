// Copyright IBM Corp. 2017. All Rights Reserved.
// Node module: @loopback/loopback-next-hello-world
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {model, property, Entity} from '../../../..';

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

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
