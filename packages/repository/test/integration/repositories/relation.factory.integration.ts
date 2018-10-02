// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/repository
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  Entity,
  DefaultCrudRepository,
  juggler,
  EntityCrudRepository,
  RelationType,
  HasManyRepository,
  ModelDefinition,
  createHasManyRepositoryFactory,
  HasManyDefinition,
  HasManyRepositoryFactory,
} from '../../..';
import {expect} from '@loopback/testlab';
import {Getter} from '@loopback/context';

describe('HasMany relation', () => {
  // Given a Customer and Order models - see definitions at the bottom
  let db: juggler.DataSource;
  let customerRepo: EntityCrudRepository<
    Customer,
    typeof Customer.prototype.id
  >;
  let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
  let reviewRepo: EntityCrudRepository<Review, typeof Review.prototype.id>;
  let customerOrderRepo: HasManyRepository<Order>;
  let customerAuthoredReviewFactoryFn: HasManyRepositoryFactory<
    Review,
    typeof Customer.prototype.id
  >;
  let customerApprovedReviewFactoryFn: HasManyRepositoryFactory<
    Review,
    typeof Customer.prototype.id
  >;
  let existingCustomerId: number;

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepositories);
  before(givenRepositoryFactoryFunctions);
  afterEach(async function resetOrderRepository() {
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

  class Review extends Entity {
    id: number;
    description: string;
    authorId: number;
    approvedId: number;

    static definition = new ModelDefinition({
      name: 'Review',
      properties: {
        id: {type: 'number', id: true},
        description: {type: 'string', required: true},
        authorId: {type: 'number', required: false},
        approvedId: {type: 'number', required: false},
      },
    });
  }

  class Customer extends Entity {
    id: number;
    name: string;
    orders: Order[];
    reviewsAuthored: Review[];
    reviewsApproved: Review[];

    static definition: ModelDefinition = new ModelDefinition({
      name: 'Customer',
      properties: {
        id: {type: 'number', id: true},
        name: {type: 'string', required: true},
        orders: {type: Order, array: true},
        reviewsAuthored: {type: Review, array: true},
        reviewsApproved: {type: Review, array: true},
      },
    })
      .addRelation({
        name: 'orders',
        type: RelationType.hasMany,
        source: Customer,
        target: () => Order,
        keyTo: 'customerId',
      })
      .addRelation({
        name: 'reviewsAuthored',
        type: RelationType.hasMany,
        source: Customer,
        target: () => Review,
        keyTo: 'authorId',
      })
      .addRelation({
        name: 'reviewsApproved',
        type: RelationType.hasMany,
        source: Customer,
        target: () => Review,
        keyTo: 'approvedId',
      });
  }

  function givenCrudRepositories() {
    db = new juggler.DataSource({connector: 'memory'});

    customerRepo = new DefaultCrudRepository(Customer, db);
    orderRepo = new DefaultCrudRepository(Order, db);
    reviewRepo = new DefaultCrudRepository(Review, db);
  }

  async function givenPersistedCustomerInstance() {
    existingCustomerId = (await customerRepo.create({name: 'a customer'})).id;
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
