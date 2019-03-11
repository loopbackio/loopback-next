// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  juggler,
  repository,
  RepositoryMixin,
  ApplicationWithRepositories,
} from '../..';
import {CustomerRepository, OrderRepository} from '../fixtures/repositories';
import {expect} from '@loopback/testlab';
import {Application} from '@loopback/core';

describe('BelongsTo relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let app: ApplicationWithRepositories;
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

    async findOwnerOfOrder(orderId: string) {
      return await this.orderRepository.customer(orderId);
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
