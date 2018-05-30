// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  DefaultCrudRepository,
  juggler,
  EntityCrudRepository,
  hasManyRepositoryFactory,
  HasManyDefinition,
  RelationType,
  HasManyEntityCrudRepository,
  ModelDefinition,
} from '../../..';
import {expect} from '@loopback/testlab';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom
  let db: juggler.DataSource;
  let customerRepo: EntityCrudRepository<
    Customer,
    typeof Customer.prototype.id
  >;
  let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
  let customerOrderRepo: HasManyEntityCrudRepository<Order>;
  let existingCustomerId: number;

  const customerHasManyOrdersRelationMeta: HasManyDefinition = {
    keyTo: 'customerId',
    type: RelationType.hasMany,
  };

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepository);
  afterEach(async function resetOrderRepository() {
    await orderRepo.deleteAll();
  });

  it('can create an instance of the related model', async () => {
    const order = await customerOrderRepo.create({
      description: 'an order desc',
    });
    const persisted = await orderRepo.findById(order.id);

    expect(order).to.deepEqual(persisted);
  });

  it('can find an instance of the related model', async () => {
    const order = await customerOrderRepo.create({
      description: 'an order desc',
    });
    const notMyOrder = await orderRepo.create({
      description: "someone else's order desc",
      customerId: existingCustomerId + 1, // a different customerId,
    });
    const persistedOrders = await orderRepo.find({
      where: {
        customerId: existingCustomerId,
      },
    });

    const orders = await customerOrderRepo.find();

    expect(orders).to.containEql(order);
    expect(orders).to.not.containEql(notMyOrder);
    expect(orders).to.deepEqual(persistedOrders);
  });

  //--- HELPERS ---//

  class Order extends Entity {
    id: number;
    description: string;
    customerId: number;

    static definition = new ModelDefinition({
      name: 'Order',
      properties: {
        id: {type: 'number', id: true},
        description: {type: 'string', required: true},
        customerId: {type: 'number', required: true},
      },
    });
  }

  class Customer extends Entity {
    id: number;
    name: string;
    orders: Order[];

    static definition = new ModelDefinition({
      name: 'Customer',
      properties: {
        id: {type: 'number', id: true},
        name: {type: 'string', required: true},
        orders: {type: Order, array: true},
      },
    });
  }

  function givenCrudRepositories() {
    db = new juggler.DataSource({connector: 'memory'});

    customerRepo = new DefaultCrudRepository(Customer, db);
    orderRepo = new DefaultCrudRepository(Order, db);
  }

  async function givenPersistedCustomerInstance() {
    existingCustomerId = (await customerRepo.create({name: 'a customer'})).id;
  }

  function givenConstrainedRepository() {
    customerOrderRepo = hasManyRepositoryFactory(
      existingCustomerId,
      customerHasManyOrdersRelationMeta,
      orderRepo,
    );
  }
});
