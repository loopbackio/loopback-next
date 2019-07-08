// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import * as _ from 'lodash';
import {
  ApplicationWithRepositories,
  juggler,
  repository,
  RepositoryMixin,
} from '../..';
import {Customer, Order} from '../fixtures/models';
import {CustomerRepository, OrderRepository} from '../fixtures/repositories';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let app: ApplicationWithRepositories;
  let controller: CustomerController;
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;
  let existingCustomerId: number;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositoriesForCustomerAndOrder);
  before(givenCustomerController);

  beforeEach(async () => {
    await orderRepo.deleteAll();
  });

  beforeEach(async () => {
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
  });

  it('can create an instance of the related model', async () => {
    const order = await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 1',
    });
    expect(order.toObject()).to.containDeep({
      customerId: existingCustomerId,
      description: 'order 1',
    });

    const persisted = await orderRepo.findById(order.id);
    expect(persisted.toObject()).to.deepEqual(order.toObject());
  });

  it('can find instances of the related model', async () => {
    const order = await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 1',
    });
    const notMyOrder = await controller.createCustomerOrders(
      existingCustomerId + 1,
      {
        description: 'order 2',
      },
    );
    const foundOrders = await controller.findCustomerOrders(existingCustomerId);
    expect(foundOrders).to.containEql(order);
    expect(foundOrders).to.not.containEql(notMyOrder);

    const persisted = await orderRepo.find({
      where: {customerId: existingCustomerId},
    });
    expect(persisted).to.deepEqual(foundOrders);
  });

  it('can patch many instances', async () => {
    await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 1',
      isShipped: false,
    });
    await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 2',
      isShipped: false,
    });
    const patchObject = {isShipped: true};
    const arePatched = await controller.patchCustomerOrders(
      existingCustomerId,
      patchObject,
    );
    expect(arePatched.count).to.equal(2);
    const patchedData = _.map(
      await controller.findCustomerOrders(existingCustomerId),
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
    await expect(
      controller.patchCustomerOrders(existingCustomerId, {
        customerId: existingCustomerId + 1,
      }),
    ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
  });

  it('can delete many instances', async () => {
    await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 1',
    });
    await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 2',
    });
    const deletedOrders = await controller.deleteCustomerOrders(
      existingCustomerId,
    );
    expect(deletedOrders.count).to.equal(2);
    const relatedOrders = await controller.findCustomerOrders(
      existingCustomerId,
    );
    expect(relatedOrders).to.be.empty();
  });

  it("does not delete instances that don't belong to the constrained instance", async () => {
    const newOrder = {
      customerId: existingCustomerId + 1,
      description: 'another order',
    };
    await orderRepo.create(newOrder);
    await controller.deleteCustomerOrders(existingCustomerId);
    const orders = await orderRepo.find();
    expect(orders).to.have.length(1);
    expect(_.pick(orders[0], ['customerId', 'description'])).to.eql(newOrder);
  });

  it('does not create an array of the related model', async () => {
    await expect(
      customerRepo.create({
        name: 'a customer',
        orders: [
          {
            description: 'order 1',
          },
        ],
      }),
    ).to.be.rejectedWith(/Navigational properties are not allowed.*"orders"/);
  });

  context('when targeting the source model', () => {
    it('gets the parent entity through the child entity', async () => {
      const parent = await customerRepo.create({name: 'parent customer'});
      const child = await customerRepo.create({
        name: 'child customer',
        parentId: parent.id,
      });

      const childsParent = await controller.getParentCustomer(child.id);

      expect(_.pick(childsParent, ['id', 'name'])).to.eql(
        _.pick(parent, ['id', 'name']),
      );
    });

    it('creates a child entity through the parent entity', async () => {
      const parent = await customerRepo.create({
        name: 'parent customer',
      });
      const child = await controller.createCustomerChildren(parent.id, {
        name: 'child customer',
      });
      expect(child.parentId).to.equal(parent.id);

      const children = await controller.findCustomerChildren(parent.id);
      expect(children).to.containEql(child);
    });
  });

  // This should be enforced by the database to avoid race conditions
  it.skip('reject create request when the customer does not exist');

  class CustomerController {
    constructor(
      @repository(CustomerRepository)
      protected customerRepository: CustomerRepository,
    ) {}

    async createCustomerOrders(
      customerId: number,
      orderData: Partial<Order>,
    ): Promise<Order> {
      return await this.customerRepository.orders(customerId).create(orderData);
    }

    async findCustomerOrders(customerId: number) {
      return await this.customerRepository.orders(customerId).find();
    }

    async patchCustomerOrders(customerId: number, order: Partial<Order>) {
      return await this.customerRepository.orders(customerId).patch(order);
    }

    async deleteCustomerOrders(customerId: number) {
      return await this.customerRepository.orders(customerId).delete();
    }

    async getParentCustomer(customerId: number) {
      return await this.customerRepository.parent(customerId);
    }

    async createCustomerChildren(
      customerId: number,
      customerData: Partial<Customer>,
    ) {
      return await this.customerRepository
        .customers(customerId)
        .create(customerData);
    }

    async findCustomerChildren(customerId: number) {
      return await this.customerRepository.customers(customerId).find();
    }
  }

  function givenApplicationWithMemoryDB() {
    class TestApp extends RepositoryMixin(Application) {}

    app = new TestApp();
    app.dataSource(new juggler.DataSource({name: 'db', connector: 'memory'}));
  }

  async function givenBoundCrudRepositoriesForCustomerAndOrder() {
    app.repository(CustomerRepository);
    app.repository(OrderRepository);
    customerRepo = await app.getRepository(CustomerRepository);
    orderRepo = await app.getRepository(OrderRepository);
  }

  async function givenCustomerController() {
    app.controller(CustomerController);
    controller = await app.get<CustomerController>(
      'controllers.CustomerController',
    );
  }

  async function givenPersistedCustomerInstance() {
    return customerRepo.create({name: 'a customer'});
  }
});
