// Copyright IBM Corp. 2019,2020. All Rights Reserved.
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

export function belongsToInclusionResolverAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  skipIf<[(this: Suite) => void], void>(
    !features.supportsInclusionResolvers,
    describe,
    'BelongsTo inclusion resolvers - acceptance',
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
        expect(orderRepo.customer.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([Customer.name, Order.name]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await orderRepo.deleteAll();
    });

    it('throws an error if it tries to query nonexists relation names', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'an order',
        customerId: customer.id,
      });
      await expect(
        orderRepo.find({include: [{relation: 'shipment'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"shipment"}`,
      );
    });

    it('returns single model instance including single related instance', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const order = await orderRepo.create({
        description: 'Mjolnir',
        customerId: thor.id,
      });
      const result = await orderRepo.find({
        include: [{relation: 'customer'}],
      });

      const expected = {
        ...order,
        isShipped: features.emptyValue,
        shipmentInfo: features.emptyValue,
        customer: {
          ...thor,
          parentId: features.emptyValue,
        },
      };
      expect(toJSON(result)).to.deepEqual([toJSON(expected)]);
    });

    it('returns multiple model instances including related instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      const thorOrder = await orderRepo.create({
        description: "Thor's Mjolnir",
        customerId: thor.id,
      });
      const odinOrder = await orderRepo.create({
        description: "Odin's Coffee Maker",
        customerId: odin.id,
      });

      const result = await orderRepo.find({
        include: [{relation: 'customer'}],
      });

      const expected = [
        {
          ...thorOrder,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          customer: {
            ...thor,
            parentId: features.emptyValue,
          },
        },
        {
          ...odinOrder,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          customer: {
            ...odin,
            parentId: features.emptyValue,
          },
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns a specified instance including its related model instances', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});
      await orderRepo.create({
        description: "Thor's Mjolnir",
        customerId: thor.id,
      });
      const odinOrder = await orderRepo.create({
        description: "Odin's Coffee Maker",
        customerId: odin.id,
      });

      const result = await orderRepo.findById(odinOrder.id, {
        include: [{relation: 'customer'}],
      });
      const expected = {
        ...odinOrder,
        isShipped: features.emptyValue,
        shipmentInfo: features.emptyValue,
        customer: {
          ...odin,
          parentId: features.emptyValue,
        },
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('queries entities with null foreign key', async () => {
      const customer = await customerRepo.create({
        name: 'Thor',
      });

      // order with customer relation
      const order1 = await orderRepo.create({
        customerId: customer.id,
        description: 'Take Out',
      });

      // order without customer relation
      const order2 = await orderRepo.create({
        description: 'Dine in',
      });

      const expected = [
        {
          ...order1,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
          customer: {
            ...customer,
            parentId: features.emptyValue,
          },
        },
        {
          ...order2,
          customerId: features.emptyValue,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
        },
      ];

      const result = await orderRepo.find({include: [{relation: 'customer'}]});
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws error if the target repository does not have the registered resolver', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'an order',
        customerId: customer.id,
      });
      // unregister the resolver
      orderRepo.inclusionResolvers.delete('customer');

      await expect(
        orderRepo.find({include: [{relation: 'customer'}]}),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"customer"}`,
      );
    });
  }
}
