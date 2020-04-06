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
  Address,
  AddressRepository,
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
    'Multi relations inclusion resolvers - acceptance',
    suite,
  );
  function suite() {
    before(deleteAllModelsInDefaultDataSource);
    let addressRepo: AddressRepository;
    let customerRepo: CustomerRepository;
    let orderRepo: OrderRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, orderRepo, addressRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        expect(customerRepo.orders.inclusionResolver).to.be.Function();

        await ctx.dataSource.automigrate([
          Customer.name,
          Order.name,
          Address.name,
        ]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await orderRepo.deleteAll();
    });

    it('include multiple relations', async () => {
      const parent = await customerRepo.create({name: 'parent'});
      const customer = await customerRepo.create({
        name: 'customer',
        //parentId: parent.id,
      });
      const address = await addressRepo.create({
        street: '8200 Warden',
        city: 'Markham',
        province: 'On',
        zipcode: '8200',
        customerId: parent.id,
      });
      const order = await orderRepo.create({
        description: 'an order',
        customerId: parent.id,
      });

      const result = await customerRepo.find({
        include: [{relation: 'orders'}, {relation: 'address'}],
      });
      const expected = [
        {
          ...parent,
          parentId: features.emptyValue,
          orders: [
            {
              ...order,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
            },
          ],
          address: address,
        },
        {
          ...customer,
          parentId: features.emptyValue, //parent.id, // doesn't have any related models
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('custom scope with `where` clause', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'to be excluded',
        customerId: customer.id,
      });
      const o2 = await orderRepo.create({
        description: 'to be included',
        customerId: customer.id,
      });
      const result = await customerRepo.find({
        include: [{relation: 'orders', scope: {where: {id: o2.id}}}],
      });
      const expected = [
        {
          ...customer,
          parentId: features.emptyValue,
          orders: [
            {
              ...o2,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
            },
          ],
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('custom scope with nested inclusion and where clause', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'to be excluded',
        customerId: customer.id,
      });
      const o2 = await orderRepo.create({
        description: 'to be included',
        customerId: customer.id,
      });
      const result = await customerRepo.find({
        include: [
          {
            relation: 'orders',
            scope: {where: {id: o2.id}, include: [{relation: 'customer'}]},
          },
        ],
      });
      const expected = [
        {
          ...customer,
          parentId: features.emptyValue,
          orders: [
            {
              ...o2,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
              customer: {...customer, parentId: features.emptyValue},
            },
          ],
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws if the custom scope contains nonexists relation name', async () => {
      const customer = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'order',
        customerId: customer.id,
      });
      await expect(
        customerRepo.find({
          include: [
            {
              relation: 'orders',
              scope: {include: [{relation: 'random'}]},
            },
          ],
        }),
      ).to.be.rejectedWith(
        `Invalid "filter.include" entries: {"relation":"random"}`,
      );
    });
  }
}
