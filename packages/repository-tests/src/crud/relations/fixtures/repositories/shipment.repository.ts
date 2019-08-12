// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/context';
import {
  HasManyRepositoryFactory,
  juggler,
  HasManyDefinition,
  createHasManyRepositoryFactory,
} from '@loopback/repository';
import {Order, Shipment, ShipmentRelations} from '../models';
import {CrudRepositoryCtor} from '../../../..';

// create the ShipmentRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createShipmentRepo(repoClass: CrudRepositoryCtor) {
  return class ShipmentRepository extends repoClass<
    Shipment,
    typeof Shipment.prototype.id,
    ShipmentRelations
  > {
    public readonly orders: HasManyRepositoryFactory<
      Order,
      typeof Shipment.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Shipment, db);
      const ordersMeta = this.entityClass.definition.relations[
        'shipmentOrders'
      ];
      this.orders = createHasManyRepositoryFactory(
        ordersMeta as HasManyDefinition,
        orderRepositoryGetter,
      );
    }
  };
}
