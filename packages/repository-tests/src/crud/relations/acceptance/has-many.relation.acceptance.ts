// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository-tests
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import _ from 'lodash';
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
  ShipmentRepository,
} from '../fixtures/models';
import {givenBoundCrudRepositories} from '../helpers';

export function hasManyRelationAcceptance(
  dataSourceOptions: DataSourceOptions,
  repositoryClass: CrudRepositoryCtor,
  features: CrudFeatures,
) {
  describe('HasMany relation (acceptance)', () => {
    before(deleteAllModelsInDefaultDataSource);
    let customerRepo: CustomerRepository;
    let orderRepo: OrderRepository;
    let shipmentRepo: ShipmentRepository;
    let existingCustomerId: MixedIdType;

    before(
      withCrudCtx(async function setupRepository(ctx: CrudTestContext) {
        ({customerRepo, orderRepo, shipmentRepo} = givenBoundCrudRepositories(
          ctx.dataSource,
          repositoryClass,
          features,
        ));
        await ctx.dataSource.automigrate([Customer.name, Order.name]);
      }),
    );

    beforeEach(async () => {
      await customerRepo.deleteAll();
      await orderRepo.deleteAll();
      await shipmentRepo.deleteAll();
    });

    beforeEach(async () => {
      existingCustomerId = (await givenPersistedCustomerInstance()).id;
    });

    it('can create an instance of the related model', async () => {
      const order = await customerRepo.orders(existingCustomerId).create({
        description: 'order 1',
      });

      expect(toJSON(order)).containDeep(
        toJSON({
          customerId: existingCustomerId,
          description: 'order 1',
        }),
      );

      const persisted = await orderRepo.findById(order.id);
      expect(toJSON(persisted)).to.deepEqual(
        toJSON({
          ...order,
          isShipped: features.emptyValue,
          shipmentInfo: features.emptyValue,
        }),
      );
    });

    it('can find instances of the related model', async () => {
      const order = await createCustomerOrders(existingCustomerId, {
        description: 'an order desc',
      });
      const anotherId = (await givenPersistedCustomerInstance()).id;
      const notMyOrder = await createCustomerOrders(anotherId, {
        description: "someone else's order desc",
      });
      const foundOrders = await findCustomerOrders(existingCustomerId);
      expect(toJSON(foundOrders)).to.containEql(
        toJSON({
          ...order,
          shipmentInfo: features.emptyValue,
          isShipped: features.emptyValue,
        }),
      );
      expect(toJSON(foundOrders)).to.not.containEql(toJSON(notMyOrder));

      const persisted = await orderRepo.find({
        where: {customerId: existingCustomerId},
      });
      expect(toJSON(persisted)).to.deepEqual(toJSON(foundOrders));
    });

    it('can find an instance of the related model with non-id property as a source key(keyFrom)', async () => {
      const shipment = await shipmentRepo.create({
        name: 'non-id prop as keyFrom relation',
        shipment_id: 999,
      });
      const order = await orderRepo.create({
        shipmentInfo: shipment.shipment_id,
        description: 'foreign key not id property',
      });

      const found = await shipmentRepo
        .shipmentOrders(order.shipmentInfo)
        .find();

      expect(toJSON(found)).containDeep(
        toJSON([
          {
            ...order,
            isShipped: features.emptyValue,
            customerId: features.emptyValue,
          },
        ]),
      );

      const persisted = await orderRepo.findById(order.id);
      expect(toJSON(persisted)).to.deepEqual(
        toJSON({
          ...order,
          isShipped: features.emptyValue,
          customerId: features.emptyValue,
        }),
      );
    });

    it('can patch many instances', async () => {
      await createCustomerOrders(existingCustomerId, {
        description: 'order 1',
        isShipped: false,
      });
      await createCustomerOrders(existingCustomerId, {
        description: 'order 2',
        isShipped: false,
      });
      const patchObject = {isShipped: true};
      const arePatched = await patchCustomerOrders(
        existingCustomerId,
        patchObject,
      );
      expect(arePatched.count).to.equal(2);
      const patchedData = _.map(
        await findCustomerOrders(existingCustomerId),
        d => _.pick(d, ['customerId', 'description', 'isShipped']),
      );

      expect(patchedData).to.eql([
        {
          customerId: existingCustomerId,
          description: 'order 1',
          isShipped: true,
        },
        {
          customerId: existingCustomerId,
          description: 'order 2',
          isShipped: true,
        },
      ]);
    });

    it('throws error when query tries to change the foreignKey', async () => {
      const anotherId = (await givenPersistedCustomerInstance()).id;
      await expect(
        patchCustomerOrders(existingCustomerId, {
          customerId: anotherId,
        }),
      ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
    });

    it('can delete many instances', async () => {
      await createCustomerOrders(existingCustomerId, {
        description: 'order 1',
      });
      await createCustomerOrders(existingCustomerId, {
        description: 'order 2',
      });
      const deletedOrders = await deleteCustomerOrders(existingCustomerId);
      expect(deletedOrders.count).to.equal(2);
      const relatedOrders = await findCustomerOrders(existingCustomerId);
      expect(relatedOrders).to.be.empty();
    });

    it("does not delete instances that don't belong to the constrained instance", async () => {
      const newId = (await givenPersistedCustomerInstance()).id;
      const newOrder = {
        customerId: newId,
        description: 'another order',
      };
      await orderRepo.create(newOrder);
      await deleteCustomerOrders(existingCustomerId);
      const orders = await orderRepo.find();
      expect(orders).to.have.length(1);
      expect(toJSON(_.pick(orders[0], ['customerId', 'description']))).to.eql(
        toJSON(newOrder),
      );
    });

    it('throws when tries to create() an instance with navigational property', async () => {
      await expect(
        customerRepo.create({
          name: 'a customer',
          orders: [
            {
              description: 'order 1',
            },
          ],
        }),
      ).to.be.rejectedWith(
        'Navigational properties are not allowed in model data (model "Customer" property "orders"), please remove it.',
      );
    });

    it('throws when tries to createAll() instancese with navigational properties', async () => {
      await expect(
        customerRepo.createAll([
          {
            name: 'a customer',
            orders: [{description: 'order 1'}],
          },
          {
            name: 'a customer',
            address: {street: '1 Amedee Bonnet'},
          },
        ]),
      ).to.be.rejectedWith(
        'Navigational properties are not allowed in model data (model "Customer" property "orders"), please remove it.',
      );
    });

    it('throws when the instance contains navigational property when operates update()', async () => {
      const created = await customerRepo.create({name: 'customer'});
      await orderRepo.create({
        description: 'pizza',
        customerId: created.id,
      });

      const found = await customerRepo.findById(created.id, {
        include: [{relation: 'orders'}],
      });
      expect(found.orders).to.have.lengthOf(1);

      found.name = 'updated name';
      await expect(customerRepo.update(found)).to.be.rejectedWith(
        /Navigational properties are not allowed.*"orders"/,
      );
    });

    it('throws when the instancees contain navigational property when operates updateAll()', async () => {
      await customerRepo.create({name: 'Mario'});
      await customerRepo.create({name: 'Luigi'});

      await expect(
        customerRepo.updateAll({
          name: 'Nintendo',
          orders: [{description: 'Switch'}],
        }),
      ).to.be.rejectedWith(/Navigational properties are not allowed.*"orders"/);
    });

    it('throws when the instance contains navigational property when operates updateById()', async () => {
      const customer = await customerRepo.create({name: 'Mario'});

      await expect(
        customerRepo.updateById(customer.id, {
          name: 'Luigi',
          orders: [{description: 'Nintendo'}],
        }),
      ).to.be.rejectedWith(/Navigational properties are not allowed.*"orders"/);
    });

    it('throws when the instance contains navigational property when operates delete()', async () => {
      const customer = await customerRepo.create({name: 'customer'});

      await orderRepo.create({
        description: 'pizza',
        customerId: customer.id,
      });

      const found = await customerRepo.findById(customer.id, {
        include: [{relation: 'orders'}],
      });

      await expect(customerRepo.delete(found)).to.be.rejectedWith(
        'Navigational properties are not allowed in model data (model "Customer" property "orders"), please remove it.',
      );
    });

    context('when targeting the source model', () => {
      it('gets the parent entity through the child entity', async () => {
        const parent = await customerRepo.create({name: 'parent customer'});

        const child = await customerRepo.create({
          name: 'child customer',
          parentId: parent.id,
        });
        const childsParent = await getParentCustomer(child.id);
        expect(_.pick(childsParent, ['id', 'name'])).to.eql(
          toJSON(_.pick(parent, ['id', 'name'])),
        );
      });

      it('creates a child entity through the parent entity', async () => {
        const parent = await customerRepo.create({name: 'parent customer'});
        const child = await createCustomerChildren(parent.id, {
          name: 'child customer',
        });

        expect(toJSON({parentId: child.parentId})).to.eql(
          toJSON({parentId: parent.id}),
        );

        const children = await findCustomerChildren(parent.id);
        expect(toJSON(children)).to.containEql(toJSON(child));
      });
    });

    // This should be enforced by the database to avoid race conditions
    it.skip('reject create request when the customer does not exist');

    // repository helper methods
    async function createCustomerOrders(
      customerId: MixedIdType,
      orderData: Partial<Order>,
    ): Promise<Order> {
      return customerRepo.orders(customerId).create(orderData);
    }

    async function findCustomerOrders(customerId: MixedIdType) {
      return customerRepo.orders(customerId).find();
    }

    async function patchCustomerOrders(
      customerId: MixedIdType,
      order: Partial<Order>,
    ) {
      return customerRepo.orders(customerId).patch(order);
    }

    async function deleteCustomerOrders(customerId: MixedIdType) {
      return customerRepo.orders(customerId).delete();
    }

    async function getParentCustomer(customerId: MixedIdType) {
      return customerRepo.parent(customerId);
    }

    async function createCustomerChildren(
      customerId: MixedIdType,
      customerData: Partial<Customer>,
    ) {
      return customerRepo.customers(customerId).create(customerData);
    }

    async function findCustomerChildren(customerId: MixedIdType) {
      return customerRepo.customers(customerId).find();
    }

    async function givenPersistedCustomerInstance() {
      return customerRepo.create({name: 'a customer'});
    }
  });
}
