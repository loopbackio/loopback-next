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
  HasManyEntityCrudRepository,
} from '../..';
import {expect} from '@loopback/testlab';
import {inject} from '@loopback/context';
import {Application} from '@loopback/core';
import {hasManyRepository} from '../../src/decorators/relation.repository.decorator';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  let existingCustomerId: number;

  beforeEach(async () => {
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
  });

  it('can create an instance of the related model', async () => {
    class TestController {
      constructor(
        @repository(CustomerRepository) protected cusRepo: CustomerRepository,
      ) {}

      async createCustomerOrders(
        customerId: number,
        orderData: Partial<Order>,
      ): Promise<Order> {
        return await this.cusRepo.orders({id: customerId}).create(orderData);
      }
    }
    class TestApp extends RepositoryMixin(Application) {}
    const app = new TestApp();
    app.repository(CustomerRepository);
    app.repository(OrderRepository);
    app.controller(TestController);
    app.dataSource(new juggler.DataSource({name: 'db', connector: 'memory'}));
    const controller = await app.get<TestController>(
      'controllers.TestController',
    );

    const order = await controller.createCustomerOrders(existingCustomerId, {
      description: 'order 1',
    });
    expect(order.toObject()).to.containDeep({
      customerId: existingCustomerId,
      description: 'order 1',
    });

    const orderRepo = await app.get<OrderRepository>(
      'repositories.OrderRepository',
    );
    const persisted = await orderRepo.findById(order.id);
    expect(persisted.toObject()).to.deepEqual(order.toObject());
  });

  // This should be enforced by the database to avoid race conditions
  it.skip('reject create request when the customer does not exist');

  //--- HELPERS ---//

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
    @property.array(Order)
    orders: Order[];
  }

  class OrderRepository extends DefaultCrudRepository<
    Order,
    typeof Order.prototype.id
  > {
    constructor(@inject('datasources.db') db: juggler.DataSource) {
      super(Order, db);
    }
  }

  class CustomerRepository extends DefaultCrudRepository<
    Customer,
    typeof Customer.prototype.id
  > {
    constructor() {
      const db = new juggler.DataSource({connector: 'memory'});
      super(Customer, db);
    }

    @hasManyRepository(OrderRepository)
    public readonly orders: (
      key: Partial<Customer>,
    ) => HasManyEntityCrudRepository<Order>;
  }

  async function givenPersistedCustomerInstance() {
    const customerRepo = new CustomerRepository();
    return customerRepo.create({name: 'a customer'});
  }
});
