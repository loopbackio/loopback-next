// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {hasMany, Entity} from '../../../..';
import {Product} from './product.model';

export class Category extends Entity {
  @hasMany(Product)
  products: Product[];
}
