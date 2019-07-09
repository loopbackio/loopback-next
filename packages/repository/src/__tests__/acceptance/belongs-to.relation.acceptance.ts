// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Application} from '@loopback/core';
import {expect} from '@loopback/testlab';
import {
  ApplicationWithRepositories,
  juggler,
  repository,
  RepositoryMixin,
} from '../..';
import {
  CustomerRepository,
  OrderRepository,
  ShipmentRepository,
} from '../fixtures/repositories';

describe('BelongsTo relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let app: ApplicationWithRepositories;
  let controller: OrderController;
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;
  let shipmentRepo: ShipmentRepository;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositories);
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

  it('can find shipment of order with a custom foreign key name', async () => {
    const shipment = await shipmentRepo.create({
      name: 'Tuesday morning shipment',
    });
    const order = await orderRepo.create({
      // eslint-disable-next-line @typescript-eslint/camelcase
      shipment_id: shipment.id,
      description: 'Order that is shipped Tuesday morning',
    });
    const result = await controller.findOrderShipment(order.id);
    expect(result).to.deepEqual(shipment);
  });

  //--- HELPERS ---//

  class OrderController {
    constructor(
      @repository(OrderRepository) protected orderRepository: OrderRepository,
    ) {}

    async findOwnerOfOrder(orderId: string) {
      return await this.orderRepository.customer(orderId);
    }

    async findOrderShipment(orderId: string) {
      return await this.orderRepository.shipment(orderId);
    }
  }

  function givenApplicationWithMemoryDB() {
    class TestApp extends RepositoryMixin(Application) {}
    app = new TestApp();
    app.dataSource(new juggler.DataSource({name: 'db', connector: 'memory'}));
  }

  async function givenBoundCrudRepositories() {
    app.repository(CustomerRepository);
    app.repository(OrderRepository);
    app.repository(ShipmentRepository);
    customerRepo = await app.getRepository(CustomerRepository);
    orderRepo = await app.getRepository(OrderRepository);
    shipmentRepo = await app.getRepository(ShipmentRepository);
  }

  async function givenOrderController() {
    app.controller(OrderController);
    controller = await app.get<OrderController>('controllers.OrderController');
  }
});
