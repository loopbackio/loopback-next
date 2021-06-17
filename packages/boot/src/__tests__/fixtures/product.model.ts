// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, model, property} from '@loopback/repository';

@model()
export class Product extends Entity {
  @property({id: true})
  id: number;

  @property({required: true})
  name: string;
}
