// Copyright The LoopBack Authors 2019,2021. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {Customer, Order, OrderRelations, Shipment} from '../models';

// create the OrderRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createOrderRepo(repoClass: CrudRepositoryCtor) {
  return class OrderRepository extends repoClass<
    Order,
    typeof Order.prototype.id,
    OrderRelations
  > {
    public readonly customer: BelongsToAccessor<
      Customer,
      typeof Order.prototype.id
    >;
    public readonly shipment: BelongsToAccessor<
      Shipment,
      typeof Order.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      customerRepositoryGetter: Getter<typeof repoClass.prototype>,
      shipmentRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Order, db);

      const customerMeta = this.entityClass.definition.relations['customer'];
      this.customer = createBelongsToAccessor(
        customerMeta as BelongsToDefinition,
        customerRepositoryGetter,
        this,
      );

      const shipmentrMeta = this.entityClass.definition.relations['shipment'];
      this.shipment = createBelongsToAccessor(
        shipmentrMeta as BelongsToDefinition,
        shipmentRepositoryGetter,
        this,
      );
    }
  };
}
