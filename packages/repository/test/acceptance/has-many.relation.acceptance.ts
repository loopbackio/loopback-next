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
  EntityCrudRepository,
  hasManyRepositoryFactory,
  HasManyDefinition,
  RelationType,
  HasManyEntityCrudRepository,
} from '../..';
import {expect} from '@loopback/testlab';
import * as _ from 'lodash';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom

  beforeEach(givenCrudRepositoriesForCustomerAndOrder);

  let existingCustomerId: number;
  //FIXME: this should be inferred from relational decorators
  let customerHasManyOrdersRelationMeta: HasManyDefinition;
  let customerOrders: HasManyEntityCrudRepository<Order>;

  beforeEach(async () => {
    existingCustomerId = (await givenPersistedCustomerInstance()).id;
    customerHasManyOrdersRelationMeta = givenHasManyRelationMetadata();
    // Ideally, we would like to write
    // customerRepo.orders.create(customerId, orderData);
    // or customerRepo.orders({id: customerId}).*
    // The initial "involved" implementation is below

    //FIXME: should be automagically instantiated via DI or other means
    customerOrders = hasManyRepositoryFactory(
      existingCustomerId,
      customerHasManyOrdersRelationMeta,
      orderRepo,
    );
  });

  it('can create an instance of the related model', async () => {
    const description = 'an order desc';
    const order = await customerOrders.create({description});

    expect(order.toObject()).to.containDeep({
      customerId: existingCustomerId,
      description,
    });
    const persisted = await orderRepo.findById(order.id);
    expect(persisted.toObject()).to.deepEqual(order.toObject());
  });

  it('can patch many instances', async () => {
    await givenCustomerOrder({description: 'order 1', isDelivered: false});
    await givenCustomerOrder({description: 'order 2', isDelivered: false});
    const patchObject = {isDelivered: true};
    const arePatched = await customerOrders.patch(patchObject);
    expect(arePatched).to.equal(2);
    const patchedData = _.map(await customerOrders.find(), d =>
      _.pick(d, ['customerId', 'description', 'isDelivered']),
    );
    expect(patchedData).to.eql([
      {
        customerId: existingCustomerId,
        description: 'order 1',
        isDelivered: true,
      },
      {
        customerId: existingCustomerId,
        description: 'order 2',
        isDelivered: true,
      },
    ]);
  });

  it('throws error when query tries to change the foreignKey', async () => {
    await expect(
      customerOrders.patch({customerId: existingCustomerId + 1}),
    ).to.be.rejectedWith(/Property "customerId" cannot be changed!/);
  });

  it('can delete many instances', async () => {
    await givenCustomerOrder({description: 'order 1'});
    await givenCustomerOrder({description: 'order 2'});
    const deletedOrders = await customerOrders.delete();
    expect(deletedOrders).to.equal(2);
    const relatedOrders = await customerOrders.find();
    expect(relatedOrders).to.be.empty();
  });

  it("does not delete instances that don't belong to the constrained instance", async () => {
    const newOrder = {
      customerId: existingCustomerId + 1,
      description: 'another order',
    };
    await orderRepo.create(newOrder);
    await customerOrders.delete();
    const orders = await orderRepo.find();
    expect(orders).to.have.length(1);
    expect(_.pick(orders[0], ['customerId', 'description'])).to.eql(newOrder);
  });

  async function givenCustomerOrder(dataObject: Partial<Order>) {
    await customerOrders.create(dataObject);
  }
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
      type: 'boolean',
      required: false,
    })
    isDelivered: boolean;

    @property({
      type: 'number',
      required: true,
    })
    customerId: number;
  }

  let customerRepo: EntityCrudRepository<
    Customer,
    typeof Customer.prototype.id
  >;
  let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
  function givenCrudRepositoriesForCustomerAndOrder() {
    const db = new juggler.DataSource({connector: 'memory'});

    customerRepo = new DefaultCrudRepository(Customer, db);
    orderRepo = new DefaultCrudRepository(Order, db);
  }

  async function givenPersistedCustomerInstance() {
    return customerRepo.create({name: 'a customer'});
  }

  function givenHasManyRelationMetadata(): HasManyDefinition {
    return {
      keyTo: 'customerId',
      type: RelationType.hasMany,
    };
  }
});
