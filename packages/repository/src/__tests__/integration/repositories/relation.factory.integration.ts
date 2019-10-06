// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {expect} from '@loopback/testlab';
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
  HasManyThroughDefinition,
  HasManyThroughRepositoryFactory,
  juggler,
  ModelDefinition,
  RelationType,
} from '../../..';
import {Seller} from '../../fixtures/models/seller.model';

// Given a Customer and Order models - see definitions at the bottom
let db: juggler.DataSource;
let customerRepo: EntityCrudRepository<Customer, typeof Customer.prototype.id>;
let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
let sellerRepo: EntityCrudRepository<Seller, typeof Seller.prototype.id>;
let reviewRepo: EntityCrudRepository<Review, typeof Review.prototype.id>;

describe('HasMany relation', () => {
  let existingCustomerId: number;

  let customerOrderRepo: HasManyRepository<Order>;
  let customerSellerRepo: HasManyThroughRepository<Seller, Order>;
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

  it('can create an instance of a related model through a junction table', async () => {
    const seller = await customerSellerRepo.create(
      {
        name: 'Jam Risser',
      },
      {
        description: 'some order description',
      },
    );
    const persisted = await sellerRepo.findById(seller.id);

    expect(seller).to.deepEqual(persisted);
  });

  it('can find an instance of a related model through a junction table', async () => {
    const seller = await customerSellerRepo.create(
      {
        name: 'Jam Risser',
      },
      {
        description: 'some order description',
      },
    );
    const notTheSeller = await sellerRepo.create(
      {
        name: 'Mark Twain',
      },
      {
        description: 'some order description',
      },
    );

    const persistedOrders = await orderRepo.find({
      where: {
        customerId: existingCustomerId,
      },
    });
    const persistedSellers = await sellerRepo.find({
      where: {
        or: persistedOrders.map((order: Order) => ({
          id: order.sellerId,
        })),
      },
    });
    const sellers = await customerSellerRepo.find();

    expect(sellers).to.containEql(seller);
    expect(sellers).to.not.containEql(notTheSeller);
    expect(sellers).to.deepEqual(persistedSellers);
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

    const sellerFactoryFn: HasManyThroughRepositoryFactory<
      Seller,
      Order,
      typeof Customer.prototype.id
    > = createHasManyThroughRepositoryFactory<
      Seller,
      typeof Seller.prototype.id,
      Order,
      typeof Order.prototype.id,
      typeof Customer.prototype.id
    >(
      Customer.definition.relations.sellers as HasManyThroughDefinition,
      Getter.fromValue(sellerRepo),
      Getter.fromValue(orderRepo),
    );

    customerOrderRepo = orderFactoryFn(existingCustomerId);
    customerSellerRepo = sellerFactoryFn(existingCustomerId);
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

//--- HELPERS ---//

class Order extends Entity {
  id: number;
  description: string;
  customerId?: number;
  sellerId?: number;

  static definition = new ModelDefinition('Order')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('description', {type: 'string', required: true})
    .addProperty('customerId', {type: 'number'})
    .addProperty('sellerId', {type: 'number'})
    .addProperty('customerId', {type: 'number', required: true})
    .addRelation({
      name: 'customer',
      type: RelationType.belongsTo,
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
  sellers: Seller[];

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
    })
    .addRelation({
      name: 'sellers',
      type: RelationType.hasMany,
      source: Customer,
      target: () => Seller,
      through: () => Order,
    });
}

function givenCrudRepositories() {
  db = new juggler.DataSource({connector: 'memory'});

  customerRepo = new DefaultCrudRepository(Customer, db);
  orderRepo = new DefaultCrudRepository(Order, db);
  reviewRepo = new DefaultCrudRepository(Review, db);
  sellerRepo = new DefaultCrudRepository(Seller, db);
}
