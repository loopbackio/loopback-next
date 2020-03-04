// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../..';
import {
  deleteAllModelsInDefaultDataSource,
  MixedIdType,
  withCrudCtx,
} from '../../../helpers.repository-tests';
import {
  Customer,
  CustomerRepository,
  Order,
  OrderRepository,
  Seller,
  SellerRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyThroughRelationAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('HasManyThrough relation (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let orderRepo: OrderRepository;
    let sellerRepo: SellerRepository;
    let existingCustomerId: MixedIdType;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({customerRepo, orderRepo, sellerRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        await ctx.dataSource.automigrate([
          Customer.name,
          Order.name,
          Seller.name,
        ]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await orderRepo.deleteAll();
      await sellerRepo.deleteAll();
    });

    beforeEach(async () => {
      existingCustomerId = (await givenPersistedCustomerInstance()).id;
    });

    it('can create related models', async () => {
      // TODO(derdeka): creating seller though order is not the best example usecase - find alternative
      const sellerData: Partial<Seller> = {
        name: 'Domino’s Pizza',
      };
      const orderData: Partial<Order> = {
        description: 'pizza',
      };
      const seller = await customerRepo
        .sellers(existingCustomerId)
        .create(sellerData, {
          throughData: orderData,
        });
      expect(toJSON(seller)).containDeep(toJSON(sellerData));

      // check target object
      const persistedSeller = await sellerRepo.findById(seller.id);
      expect(toJSON(persistedSeller)).containDeep(toJSON(sellerData));

      // check through object
      const persistedOrders: Order[] = await orderRepo.find({
        where: {
          sellerId: seller.id,
          customerId: existingCustomerId,
        },
      });
      expect(persistedOrders.length).to.eql(1);
      expect(persistedOrders[0]).containDeep(toJSON(orderData));
    });

    async function givenPersistedCustomerInstance() {
      return customerRepo.create({name: 'a customer'});
    }
  });
}
