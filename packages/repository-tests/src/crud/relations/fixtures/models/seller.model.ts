// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  EntityCrudRepository,
  hasMany,
  HasManyThroughRepositoryFactory,
  model,
  property,
} from '@loopback/repository';
import {Customer, CustomerWithRelations} from './customer.model';
import {Order} from './order.model';

@model()
export class Seller extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => Customer, {
    through: {
      model: () => Order,
    },
  })
  customers?: Customer[];
}

export interface SellerRelations {
  customers?: CustomerWithRelations;
}

export type SellerWithRelations = Seller & SellerRelations;

export interface SellerRepository
  extends EntityCrudRepository<Seller, typeof Seller.prototype.id> {
  // define additional members like relation methods here
  customers: HasManyThroughRepositoryFactory<
    Customer,
    typeof Customer.prototype.id,
    Order,
    typeof Seller.prototype.id
  >;
}
