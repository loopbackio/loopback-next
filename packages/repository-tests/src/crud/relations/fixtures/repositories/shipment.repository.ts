// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Getter} from '@loopback/core';
import {
  createHasManyRepositoryFactory,
  HasManyDefinition,
  HasManyRepositoryFactory,
  juggler,
} from '@loopback/repository';
import {CrudRepositoryCtor} from '../../../..';
import {Order, Shipment, ShipmentRelations} from '../models';

// create the ShipmentRepo by calling this func so that it can be extended from CrudRepositoryCtor
export function createShipmentRepo(repoClass: CrudRepositoryCtor) {
  return class ShipmentRepository extends repoClass<
    Shipment,
    typeof Shipment.prototype.id,
    ShipmentRelations
  > {
    public readonly shipmentOrders: HasManyRepositoryFactory<
      Order,
      typeof Shipment.prototype.id
    >;

    constructor(
      db: juggler.DataSource,
      orderRepositoryGetter: Getter<typeof repoClass.prototype>,
    ) {
      super(Shipment, db);
      const shipmentOrdersMeta = this.entityClass.definition.relations[
        'shipmentOrders'
      ];
      this.shipmentOrders = createHasManyRepositoryFactory(
        shipmentOrdersMeta as HasManyDefinition,
        orderRepositoryGetter,
      );
    }
  };
}
