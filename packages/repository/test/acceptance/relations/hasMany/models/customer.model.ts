// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Entity, Class} from '../../../../../';
import {Order} from './order.model';
import {OrderRepository} from '../repositories/order.repository';
import {Repository} from '../../../../../src/repositories';
import {model, property, hasMany} from '../../../../../src/decorators';
import {
  HasManyEntityCrudRepository,
  DefaultHasManyEntityCrudRepository,
} from '../../../../../src/repositories/relation.repository';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
    regexp: '^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$',
  })
  email: string;

  @hasMany({
    target: Order,
  })
  customerOrders: HasManyEntityCrudRepository<Order, typeof Order.prototype.id>;
}
