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
  ShipmentRepository,
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
    let shipmentRepo: ShipmentRepository;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        // this helper should create the inclusion resolvers and also
        // register inclusion resolvers for us
        ({customerRepo, orderRepo, shipmentRepo} = givenBoundCrudRepositories(
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
      await shipmentRepo.deleteAll();
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
              shipmentInfo: features.emptyValue,
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
              shipmentInfo: features.emptyValue,
            },
            {
              ...thorOrderPizza,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
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
              shipmentInfo: features.emptyValue,
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
            shipmentInfo: features.emptyValue,
          },
        ],
      };
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('returns related models with non-id property as a source key(keyFrom)', async () => {
      const shipment = await shipmentRepo.create({
        name: 'non-id prop as keyFrom relation',
        shipment_id: 999,
      });
      const order = await orderRepo.create({
        // foreign key is a non-id property
        shipmentInfo: shipment.shipment_id,
        description: 'foreign key not id property',
      });

      const found = await shipmentRepo.find({
        include: [{relation: 'shipmentOrders'}],
      });

      expect(toJSON(found)).containDeep(
        toJSON([
          {
            ...shipment,
            shipmentOrders: [
              {
                ...order,
                isShipped: features.emptyValue,
                customerId: features.emptyValue,
              },
            ],
          },
        ]),
      );
    });

    skipIf(
      features.hasRevisionToken,
      it,
      'returns inclusions after running save() operation',
      async () => {
        // this shows save() works well with func ensurePersistable and ObjectId
        // the test skips for Cloudant as it needs the _rev property for replacement.
        // see replace-by-id.suite.ts
        const thor = await customerRepo.create({name: 'Thor'});
        const odin = await customerRepo.create({name: 'Odin'});

        const thorOrder = await orderRepo.create({
          customerId: thor.id,
          description: 'Pizza',
        });

        const pizza = await orderRepo.findById(thorOrder.id);
        pizza.customerId = odin.id;

        await orderRepo.save(pizza);
        const odinPizza = await orderRepo.findById(thorOrder.id);

        const result = await customerRepo.findById(odin.id, {
          include: [{relation: 'orders'}],
        });
        const expected = {
          ...odin,
          parentId: features.emptyValue,
          orders: [
            {
              ...odinPizza,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
            },
          ],
        };
        expect(toJSON(result)).to.containEql(toJSON(expected));
      },
    );

    skipIf(
      features.hasRevisionToken,
      it,
      'returns inclusions after running replaceById() operation',
      async () => {
        // this shows replaceById() works well with func ensurePersistable and ObjectId
        // the test skips for Cloudant as it needs the _rev property for replacement.
        // see replace-by-id.suite.ts
        const thor = await customerRepo.create({name: 'Thor'});
        const odin = await customerRepo.create({name: 'Odin'});

        const thorOrder = await orderRepo.create({
          customerId: thor.id,
          description: 'Pizza',
        });

        const pizza = await orderRepo.findById(thorOrder.id.toString());
        pizza.customerId = odin.id;
        // FIXME: [mongo] if pizza obj is converted to JSON obj, it would get an error
        // because it tries to convert ObjectId to string type.
        // should test with JSON obj once it's fixed.

        await orderRepo.replaceById(pizza.id, pizza);
        const odinPizza = await orderRepo.findById(thorOrder.id);

        const result = await customerRepo.find({
          include: [{relation: 'orders'}],
        });
        const expected = [
          {
            ...thor,
            parentId: features.emptyValue,
          },
          {
            ...odin,
            parentId: features.emptyValue,
            orders: [
              {
                ...odinPizza,
                isShipped: features.emptyValue,
                shipmentInfo: features.emptyValue,
              },
            ],
          },
        ];
        expect(toJSON(result)).to.deepEqual(toJSON(expected));
      },
    );

    it('returns inclusions after running updateById() operation', async () => {
      const thor = await customerRepo.create({name: 'Thor'});
      const odin = await customerRepo.create({name: 'Odin'});

      const thorOrder = await orderRepo.create({
        customerId: thor.id,
        description: 'Pizza',
      });

      const pizza = await orderRepo.findById(thorOrder.id.toString());
      pizza.customerId = odin.id;
      const reheatedPizza = toJSON(pizza);

      await orderRepo.updateById(pizza.id, reheatedPizza);
      const odinPizza = await orderRepo.findById(thorOrder.id);

      const result = await customerRepo.find({
        include: [{relation: 'orders'}],
      });
      const expected = [
        {
          ...thor,
          parentId: features.emptyValue,
        },
        {
          ...odin,
          parentId: features.emptyValue,
          orders: [
            {
              ...odinPizza,
              isShipped: features.emptyValue,
              shipmentInfo: features.emptyValue,
            },
          ],
        },
      ];
      expect(toJSON(result)).to.deepEqual(toJSON(expected));
    });

    it('throws when navigational properties are present when updating model instance with save()', async () => {
      // save() calls replaceById so the result will be the same for replaceById
      const customer = await customerRepo.create({name: 'customer'});
      const anotherCus = await customerRepo.create({name: 'another customer'});
      const customerId = customer.id;

      await orderRepo.create({
        description: 'pizza',
        customerId,
      });

      const found = await customerRepo.findById(customerId, {
        include: [{relation: 'orders'}],
      });
      expect(found.orders).to.have.lengthOf(1);

      const wrongOrder = await orderRepo.create({
        description: 'wrong order',
        customerId: anotherCus.id,
      });

      found.name = 'updated name';
      found.orders.push(wrongOrder);

      await expect(customerRepo.save(found)).to.be.rejectedWith(
        /Navigational properties are not allowed.*"orders"/,
      );
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
