// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  model,
  property,
  Entity,
  DefaultCrudRepository,
  juggler,
  hasMany,
  repository,
  RepositoryMixin,
  AppWithRepository,
  hasManyRepository,
  HasManyRepositoryFactory,
} from '../..';
import {expect} from '@loopback/testlab';
import {inject} from '@loopback/context';
import {Application} from '@loopback/core';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let app: AppWithRepository;
  let controller: CustomerController;
  let customerRepo: CustomerRepository;
  let orderRepo: OrderRepository;
  let existingCustomerId: number;

  before(givenApplicationWithMemoryDB);
  before(givenBoundCrudRepositoriesForCustomerAndOrder);
  before(givenCustomerController);

  beforeEach(async () => {
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
  });
  afterEach(async () => {
    await orderRepo.deleteAll();
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

  // This should be enforced by the database to avoid race conditions
  it.skip('reject create request when the customer does not exist');

  //--- HELPERS ---//

  @model()
  class Customer extends Entity {
    @property({
      type: 'number',
      id: true,
    })
    id: number;

    @property({
      type: 'string',
    })
    name: string;

    @hasMany({keyTo: 'customerId'})
    orders: Order[];
  }

  @model()
  class Order extends Entity {
    @property({
      type: 'number',
      id: true,
    })
    id: number;

    @property({
      type: 'string',
      required: true,
    })
    description: string;

    @property({
      type: 'number',
      required: true,
    })
    customerId: number;
  }

  class OrderRepository extends DefaultCrudRepository<
    Order,
    typeof Order.prototype.id
  > {
    constructor(@inject('datasources.db') protected db: juggler.DataSource) {
      super(Order, db);
    }
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor(
      @inject('datasources.db') protected db: juggler.DataSource,
      @hasManyRepository(OrderRepository)
      public readonly orders: HasManyRepositoryFactory<Customer, Order>,
    ) {
      super(Customer, db);
    }
  }

  class CustomerController {
    constructor(
      @repository(CustomerRepository)
      protected customerRepository: CustomerRepository,
    ) {}

    async createCustomerOrders(
      customerId: number,
      orderData: Partial<Order>,
    ): Promise<Order> {
      return await this.customerRepository
        .orders({id: customerId})
        .create(orderData);
    }

    async findCustomerOrders(customerId: number) {
      return await this.customerRepository.orders({id: customerId}).find();
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
