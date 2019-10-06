// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  EntityNotFoundError,
  Getter,
} from '@loopback/repository';
import {expect, toJSON} from '@loopback/testlab';
import {
  deleteAllModelsInDefaultDataSource,
  withCrudCtx,
} from '../../../helpers.repository-tests';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../../types.repository-tests';
import {
  Customer,
  CustomerRepository,
  Order,
  OrderRepository,
  Shipment,
  ShipmentRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function belongsToRelationAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('BelongsTo relation (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);

    let findCustomerOfOrder: BelongsToAccessor<
      Customer,
      typeof Order.prototype.id
    >;
    let customerRepo: CustomerRepository;
    let orderRepo: OrderRepository;
    let shipmentRepo: ShipmentRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({customerRepo, orderRepo, shipmentRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        const models = [Customer, Order, Shipment];
        await ctx.dataSource.automigrate(models.map(m => m.name));
      }),
    );
    before(givenAccessor);
    beforeEach(async () => {
      await orderRepo.deleteAll();
    });

    it('can find customer of order', async () => {
      const customer = await customerRepo.create({
        name: 'Order McForder',
      });
      const order = await orderRepo.create({
        customerId: customer.id,
        description: 'Order from Order McForder, the hoarder of Mordor',
      });

      const result = await orderRepo.customer(order.id);
      // adding parentId to customer so MySQL doesn't complain about null vs
      // undefined
      expect(toJSON(result)).to.deepEqual(
        toJSON({...customer, parentId: features.emptyValue}),
      );
    });

    it('can find shipment of order with a custom foreign key name', async () => {
      const shipment = await shipmentRepo.create({
        name: 'Tuesday morning shipment',
      });
      const order = await orderRepo.create({
        // eslint-disable-next-line @typescript-eslint/camelcase
        shipment_id: shipment.id,
        description: 'Order that is shipped Tuesday morning',
      });
      const result = await orderRepo.shipment(order.id);
      expect(result).to.deepEqual(shipment);
    });

    it('throws EntityNotFound error when the related model does not exist', async () => {
      const deletedCustomer = await customerRepo.create({
        name: 'Order McForder',
      });
      const order = await orderRepo.create({
        customerId: deletedCustomer.id,
        description: 'custotmer will be deleted',
      });
      await customerRepo.deleteAll();

      await expect(findCustomerOfOrder(order.id)).to.be.rejectedWith(
        EntityNotFoundError,
      );
    });

    // helpers
    function givenAccessor() {
      findCustomerOfOrder = createBelongsToAccessor(
        Order.definition.relations.customer as BelongsToDefinition,
        Getter.fromValue(customerRepo),
        orderRepo,
      );
    }
  });
}
