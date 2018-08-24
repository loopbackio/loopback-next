// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {juggler, repository, RepositoryMixin, AppWithRepository} from '../..';
import {CustomerRepository, OrderRepository} from '../fixtures/repositories';
import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let app: AppWithRepository;
  let controller: OrderController;
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositoriesForCustomerAndOrder);
  before(givenOrderController);

  beforeEach(async () => {
    await orderRepo.deleteAll();
  });

  it('can find customer of order', async () => {
    const customer = await customerRepo.create({name: 'Order McForder'});
    const order = await orderRepo.create({
      customerId: customer.id,
      description: 'Order from Order McForder, the hoarder of Mordor',
    });
    const result = await controller.findOwnerOfOrder(order.id);
    expect(result).to.deepEqual(customer);
  });

  //--- HELPERS ---//

  class OrderController {
    constructor(
      @repository(OrderRepository) protected orderRepository: OrderRepository,
    ) {}

    async findOwnerOfOrder(orderId: number) {
      const order = await this.orderRepository.findById(orderId);
      return await this.orderRepository.customer(order);
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

  async function givenOrderController() {
    app.controller(OrderController);
    controller = await app.get<OrderController>('controllers.OrderController');
  }
});
