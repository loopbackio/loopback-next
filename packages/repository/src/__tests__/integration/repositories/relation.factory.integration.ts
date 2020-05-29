// Copyright IBM Corp. 2019,2020. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect, toJSON} from '@loopback/testlab';
import {
  BelongsToAccessor,
  BelongsToDefinition,
  createBelongsToAccessor,
  createHasManyRepositoryFactory,
  createHasManyThroughRepositoryFactory,
  DefaultCrudRepository,
  Entity,
  EntityCrudRepository,
  EntityNotFoundError,
  Getter,
  HasManyDefinition,
  HasManyRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepository,
  HasManyThroughRepositoryFactory,
  juggler,
  ModelDefinition,
  RelationType,
} from '../../..';

// Given a Customer and Order models - see definitions at the bottom
let db: juggler.DataSource;
let customerRepo: EntityCrudRepository<Customer, typeof Customer.prototype.id>;
let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
let customerOrderLinkRepo: EntityCrudRepository<
  CustomerOrderLink,
  typeof CustomerOrderLink.prototype.id
>;
let reviewRepo: EntityCrudRepository<Review, typeof Review.prototype.id>;

describe('HasMany relation', () => {
  let existingCustomerId: number;

  let customerOrderRepo: HasManyRepository<Order>;
  let customerAuthoredReviewFactoryFn: HasManyRepositoryFactory<
    Review,
    typeof Customer.prototype.id
  >;
  let customerApprovedReviewFactoryFn: HasManyRepositoryFactory<
    Review,
    typeof Customer.prototype.id
  >;

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepositories);
  before(givenRepositoryFactoryFunctions);

  beforeEach(async function resetDatabase() {
    await orderRepo.deleteAll();
    await reviewRepo.deleteAll();
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

  it('finds appropriate related model instances for multiple relations', async () => {
    // note(shimks): roundabout way of creating reviews with 'approves'
    // ideally, the review repository should have a approve function
    // which should 'approve' a review
    // On another note, this test should be separated for 'create' and 'find'
    await customerAuthoredReviewFactoryFn(existingCustomerId).create({
      description: 'my wonderful review',
      approvedId: existingCustomerId + 1,
    });
    await customerAuthoredReviewFactoryFn(existingCustomerId + 1).create({
      description: 'smash that progenitor loving approve button',
      approvedId: existingCustomerId,
    });

    const reviewsApprovedByCustomerOne = await customerApprovedReviewFactoryFn(
      existingCustomerId,
    ).find();
    const reviewsApprovedByCustomerTwo = await customerApprovedReviewFactoryFn(
      existingCustomerId + 1,
    ).find();

    const persistedReviewsApprovedByCustomerOne = await reviewRepo.find({
      where: {
        approvedId: existingCustomerId,
      },
    });
    const persistedReviewsApprovedByCustomerTwo = await reviewRepo.find({
      where: {
        approvedId: existingCustomerId + 1,
      },
    });

    expect(reviewsApprovedByCustomerOne).to.eql(
      persistedReviewsApprovedByCustomerOne,
    );
    expect(reviewsApprovedByCustomerTwo).to.eql(
      persistedReviewsApprovedByCustomerTwo,
    );
  });

  //--- HELPERS ---//

  async function givenPersistedCustomerInstance() {
    const customer = await customerRepo.create({name: 'a customer'});
    existingCustomerId = customer.id;
  }

  function givenConstrainedRepositories() {
    const orderFactoryFn = createHasManyRepositoryFactory<
      Order,
      typeof Order.prototype.id,
      typeof Customer.prototype.id
    >(
      Customer.definition.relations.orders as HasManyDefinition,
      Getter.fromValue(orderRepo),
    );

    customerOrderRepo = orderFactoryFn(existingCustomerId);
  }

  function givenRepositoryFactoryFunctions() {
    customerAuthoredReviewFactoryFn = createHasManyRepositoryFactory(
      Customer.definition.relations.reviewsAuthored as HasManyDefinition,
      Getter.fromValue(reviewRepo),
    );
    customerApprovedReviewFactoryFn = createHasManyRepositoryFactory(
      Customer.definition.relations.reviewsApproved as HasManyDefinition,
      Getter.fromValue(reviewRepo),
    );
  }
});

describe('BelongsTo relation', () => {
  let findCustomerOfOrder: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  before(givenCrudRepositories);
  before(givenAccessor);
  beforeEach(async function resetDatabase() {
    await Promise.all([
      customerRepo.deleteAll(),
      orderRepo.deleteAll(),
      reviewRepo.deleteAll(),
    ]);
  });

  it('finds an instance of the related model', async () => {
    const customer = await customerRepo.create({name: 'Order McForder'});
    const order = await orderRepo.create({
      customerId: customer.id,
      description: 'Order from Order McForder, the hoarder of Mordor',
    });

    const result = await findCustomerOfOrder(order.id);

    expect(result).to.deepEqual(customer);
  });

  it('throws EntityNotFound error when the related model does not exist', async () => {
    const order = await orderRepo.create({
      customerId: 999, // does not exist
      description: 'Order of a fictional customer',
    });

    await expect(findCustomerOfOrder(order.id)).to.be.rejectedWith(
      EntityNotFoundError,
    );
  });

  //--- HELPERS ---//

  function givenAccessor() {
    findCustomerOfOrder = createBelongsToAccessor(
      Order.definition.relations.customer as BelongsToDefinition,
      Getter.fromValue(customerRepo),
      orderRepo,
    );
  }
});

describe.only('HasManyThrough relation', () => {
  let existingCustomerId: number;

  let hasManyThroughRepo: HasManyThroughRepository<
    Order,
    typeof Order.prototype.id,
    CustomerOrderLink
  >;
  let hasManyThroughFactory: HasManyThroughRepositoryFactory<
    Order,
    typeof Order.prototype.id,
    CustomerOrderLink,
    typeof Customer.prototype.id
  >;

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepositories);

  beforeEach(async function resetDatabase() {
    await customerRepo.deleteAll();
    await customerOrderLinkRepo.deleteAll();
    await orderRepo.deleteAll();
  });

  it('can create an target instance alone with the corresponding through model', async () => {
    const order = await hasManyThroughRepo.create(
      {
        description: 'an order hasManyThrough',
      },
      {
        throughData: {id: 99},
      },
    );
    const persistedOrder = await orderRepo.findById(order.id);
    const persistedLink = await customerOrderLinkRepo.find();
    expect(order).to.deepEqual(persistedOrder);
    expect(persistedLink).have.length(1);
    const expected = {
      id: 99,
      customerId: existingCustomerId,
      orderId: order.id,
    };
    expect(toJSON(persistedLink[0])).to.deepEqual(toJSON(expected));
  });

  it('can find an instance via through model', async () => {
    const order = await hasManyThroughRepo.create(
      {
        description: 'an order hasManyThrough',
      },
      {
        throughData: {id: 99},
      },
    );
    const notMyOrder = await orderRepo.create({
      description: "someone else's order desc",
    });

    const orders = await hasManyThroughRepo.find();

    expect(orders).to.not.containEql(notMyOrder);
    expect(orders).to.deepEqual([order]);
  });

  it('can find instances via through models', async () => {
    const order1 = await hasManyThroughRepo.create(
      {
        description: 'group 1',
      },
      {
        throughData: {id: 99},
      },
    );
    const order2 = await hasManyThroughRepo.create(
      {
        description: 'group 2',
      },
      {
        throughData: {id: 98},
      },
    );
    const orders = await hasManyThroughRepo.find();

    expect(orders).have.length(2);
    expect(orders).to.deepEqual([order1, order2]);
    const group1 = await hasManyThroughRepo.find({
      where: {description: 'group 1'},
    });
    expect(group1).to.deepEqual([order1]);
  });

  it('can delete an instance alone through model', async () => {
    const order1 = await hasManyThroughRepo.create(
      {
        description: 'customer 1',
      },
      {
        throughData: {id: 98},
      },
    );
    const anotherHasManyThroughRepo = hasManyThroughFactory(
      existingCustomerId + 1,
    );
    const order2 = await anotherHasManyThroughRepo.create(
      {
        description: 'customer 2',
      },
      {
        throughData: {id: 99},
      },
    );
    let orders = await orderRepo.find();
    let links = await customerOrderLinkRepo.find();

    expect(orders).have.length(2);
    expect(links).have.length(2);

    await hasManyThroughRepo.delete();
    orders = await orderRepo.find();
    orders = await orderRepo.find();
    links = await customerOrderLinkRepo.find();

    expect(orders).have.length(1);
    expect(links).have.length(1);
    expect(orders).to.deepEqual([order2]);
    expect(links[0]).has.property('orderId', order2.id);
    expect(links[0]).has.property('customerId', existingCustomerId + 1);
  });

  it('can delete an instance alone through model', async () => {
    const order1 = await hasManyThroughRepo.create(
      {
        description: 'customer 1',
      },
      {
        throughData: {id: 98},
      },
    );
    const anotherHasManyThroughRepo = hasManyThroughFactory(
      existingCustomerId + 1,
    );
    const order2 = await anotherHasManyThroughRepo.create(
      {
        description: 'customer 2',
      },
      {
        throughData: {id: 99},
      },
    );
    const through = await customerOrderLinkRepo.create({
      id: 1,
      customerId: existingCustomerId + 1,
      orderId: order1.id,
    });
    let orders = await orderRepo.find();
    let links = await customerOrderLinkRepo.find();

    expect(orders).have.length(2);
    expect(links).have.length(3);

    await hasManyThroughRepo.delete();

    orders = await orderRepo.find();
    orders = await orderRepo.find();
    links = await customerOrderLinkRepo.find();

    expect(orders).have.length(1);
    expect(links).have.length(1);
    expect(orders).to.deepEqual([order2]);
    expect(links).to.not.containEql(through);
    expect(links[0]).has.property('orderId', order2.id);
    expect(links[0]).has.property('customerId', existingCustomerId + 1);
  });

  it('can find instances via through models', async () => {
    const order = await hasManyThroughRepo.create(
      {
        description: 'group 1',
      },
      {
        throughData: {id: 99},
      },
    );
    await hasManyThroughRepo.patch({description: 'group 2'});
    const updateResult = await orderRepo.find();
    expect(toJSON(updateResult)).to.containDeep(
      toJSON([{id: order.id, description: 'group 2', customerId: undefined}]),
    );
  });

  it('can patch instances that belong to the same source model (same source fk)', async () => {
    const order1 = await hasManyThroughRepo.create(
      {
        description: 'group 1',
      },
      {
        throughData: {id: 99},
      },
    );
    const order2 = await hasManyThroughRepo.create(
      {
        description: 'group 1',
      },
      {
        throughData: {id: 98},
      },
    );

    const count = await hasManyThroughRepo.patch({description: 'group 2'});
    expect(count).to.match({count: 2});
    const updateResult = await orderRepo.find();
    expect(toJSON(updateResult)).to.containDeep(
      toJSON([
        {id: order1.id, description: 'group 2', customerId: undefined},
        {id: order2.id, description: 'group 2', customerId: undefined},
      ]),
    );
  });
  //--- HELPERS ---//

  async function givenPersistedCustomerInstance() {
    const customer = await customerRepo.create({name: 'a customer'});
    existingCustomerId = customer.id;
  }

  function givenConstrainedRepositories() {
    hasManyThroughFactory = createHasManyThroughRepositoryFactory<
      Order,
      typeof Order.prototype.id,
      CustomerOrderLink,
      typeof CustomerOrderLink.prototype.id,
      typeof Customer.prototype.id
    >(
      {
        name: 'products',
        type: 'hasMany',
        targetsMany: true,
        source: Customer,
        keyFrom: 'id',
        target: () => Order,
        keyTo: 'id',
        through: {
          model: () => CustomerOrderLink,
          keyFrom: 'customerId',
          keyTo: 'orderId',
        },
      } as HasManyDefinition,
      Getter.fromValue(orderRepo),
      Getter.fromValue(customerOrderLinkRepo),
    );

    hasManyThroughRepo = hasManyThroughFactory(existingCustomerId);
  }
});

//--- HELPERS ---//

class Order extends Entity {
  id: number;
  description: string;
  customerId: number;

  static definition = new ModelDefinition('Order')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('description', {type: 'string', required: true})
    .addProperty('customerId', {type: 'number', required: false})
    .addRelation({
      name: 'customer',
      type: RelationType.belongsTo,
      targetsMany: false,
      source: Order,
      target: () => Customer,
      keyFrom: 'customerId',
      keyTo: 'id',
    });
}

class Review extends Entity {
  id: number;
  description: string;
  authorId: number;
  approvedId: number;

  static definition = new ModelDefinition('Review')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('description', {type: 'string', required: true})
    .addProperty('authorId', {type: 'number', required: false})
    .addProperty('approvedId', {type: 'number', required: false});
}

class Customer extends Entity {
  id: number;
  name: string;
  orders: Order[];
  reviewsAuthored: Review[];
  reviewsApproved: Review[];

  static definition: ModelDefinition = new ModelDefinition('Customer')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('name', {type: 'string', required: true})
    .addProperty('orders', {type: Order, array: true})
    .addProperty('reviewsAuthored', {type: Review, array: true})
    .addProperty('reviewsApproved', {type: Review, array: true})
    .addRelation({
      name: 'orders',
      type: RelationType.hasMany,
      targetsMany: true,
      source: Customer,
      target: () => Order,
      keyTo: 'customerId',
    })
    .addRelation({
      name: 'reviewsAuthored',
      type: RelationType.hasMany,
      targetsMany: true,
      source: Customer,
      target: () => Review,
      keyTo: 'authorId',
    })
    .addRelation({
      name: 'reviewsApproved',
      type: RelationType.hasMany,
      targetsMany: true,
      source: Customer,
      target: () => Review,
      keyTo: 'approvedId',
    });
}

class CustomerOrderLink extends Entity {
  id: number;
  customerId: number;
  orderId: number;
  static definition = new ModelDefinition('CustomerOrderLink')
    .addProperty('id', {
      type: 'number',
      id: true,
      required: true,
    })
    .addProperty('orderId', {type: 'number'})
    .addProperty('customerId', {type: 'number'});
}
function givenCrudRepositories() {
  db = new juggler.DataSource({connector: 'memory'});

  customerRepo = new DefaultCrudRepository(Customer, db);
  orderRepo = new DefaultCrudRepository(Order, db);
  customerOrderLinkRepo = new DefaultCrudRepository(CustomerOrderLink, db);
  reviewRepo = new DefaultCrudRepository(Review, db);
}
