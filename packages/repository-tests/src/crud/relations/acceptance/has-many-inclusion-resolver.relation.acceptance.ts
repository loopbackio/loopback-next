// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, skipIf, toJSON} from '@loopback/testlab';
import {Suite} from 'mocha';
import {
  CrudFeatures,
  CrudRepositoryCtor,
  CrudTestContext,
  DataSourceOptions,
} from '../../..';
import {
  deleteAllModelsInDefaultDataSource,
  withCrudCtx,
} from '../../../helpers.repository-tests';
import {
  Customer,
  CustomerRepository,
  Order,
  OrderRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyInclusionResolverAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'HasMany inclusion resolvers - acceptance',
    suite,
  );
  function suite() {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let orderRepo: OrderRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, orderRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        expect(customerRepo.orders.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([Customer.name, Order.name]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await orderRepo.deleteAll();
    });

    it('throws an error if tries to query nonexists relation names', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'an order',
        customerId: customer.id,
      });
      await expect(
        customerRepo.find({include: [{relation: 'managers'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"managers"}`,
      );
    });

    it('returns single model instance including single related instance', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const thorOrder = await orderRepo.create({
        customerId: thor.id,
        description: "Thor's Mjolnir",
      });
      const result = await customerRepo.find({
        include: [{relation: 'orders'}],
      });

      expect(toJSON(result)).to.deepEqual([
        toJSON({
          ...thor,
          parentId: features.emptyValue,
          orders: [
            {
              ...thorOrder,
              isShipped: features.emptyValue,
              // eslint-disable-next-line @typescript-eslint/camelcase
              shipment_id: features.emptyValue,
            },
          ],
        }),
      ]);
    });

    it('returns multiple model instances including related instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      const thorOrderMjolnir = await orderRepo.create({
        customerId: thor.id,
        description: 'Mjolnir',
      });
      const thorOrderPizza = await orderRepo.create({
        customerId: thor.id,
        description: 'Pizza',
      });
      const odinOrderCoffee = await orderRepo.create({
        customerId: odin.id,
        description: 'Coffee',
      });

      const result = await customerRepo.find({
        include: [{relation: 'orders'}],
      });

      const expected = [
        {
          ...thor,
          orders: [
            {
              ...thorOrderMjolnir,
              isShipped: features.emptyValue,
              // eslint-disable-next-line @typescript-eslint/camelcase
              shipment_id: features.emptyValue,
            },
            {
              ...thorOrderPizza,
              isShipped: features.emptyValue,
              // eslint-disable-next-line @typescript-eslint/camelcase
              shipment_id: features.emptyValue,
            },
          ],
          parentId: features.emptyValue,
        },
        {
          ...odin,
          parentId: features.emptyValue,
          orders: [
            {
              ...odinOrderCoffee,
              isShipped: features.emptyValue,
              // eslint-disable-next-line @typescript-eslint/camelcase
              shipment_id: features.emptyValue,
            },
          ],
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns a specified instance including its related model instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      await orderRepo.create({
        customerId: thor.id,
        description: 'Mjolnir',
      });
      await orderRepo.create({
        customerId: thor.id,
        description: 'Pizza',
      });
      const odinOrder = await orderRepo.create({
        customerId: odin.id,
        description: 'Coffee',
      });

      const result = await customerRepo.findById(odin.id, {
        include: [{relation: 'orders'}],
      });
      const expected = {
        ...odin,
        parentId: features.emptyValue,
        orders: [
          {
            ...odinOrder,
            isShipped: features.emptyValue,
            // eslint-disable-next-line @typescript-eslint/camelcase
            shipment_id: features.emptyValue,
          },
        ],
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws when navigational properties are present when updating model instance', async () => {
      const created = await customerRepo.create({name: 'customer'});
      const customerId = created.id;

      await orderRepo.create({
        description: 'pizza',
        customerId,
      });

      const found = await customerRepo.findById(customerId, {
        include: [{relation: 'orders'}],
      });
      expect(found.orders).to.have.lengthOf(1);

      found.name = 'updated name';
      await expect(customerRepo.save(found)).to.be.rejectedWith(
        'The `Customer` instance is not valid. Details: `orders` is not defined in the model (value: undefined).',
      );
    });
    // scope for inclusion is not supported yet
    it('throws error if the inclusion query contains a non-empty scope', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'an order',
        customerId: customer.id,
      });
      await expect(
        customerRepo.find({
          include: [{relation: 'orders', scope: {limit: 1}}],
        }),
      ).to.be.rejectedWith(`scope is not supported`);
    });

    it('throws error if the target repository does not have the registered resolver', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'an order',
        customerId: customer.id,
      });
      // unregister the resolver
      customerRepo.inclusionResolvers.delete('orders');

      await expect(
        customerRepo.find({include: [{relation: 'orders'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"orders"}`,
      );
    });
  }
}
