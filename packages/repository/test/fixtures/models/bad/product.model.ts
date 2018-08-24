// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {belongsTo, Entity} from '../../../..';
import {Category} from './category.model';

export class Product extends Entity {
  @belongsTo(Category)
  categoryId: number;
}
