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
} from '../../..';
import {expect} from '@loopback/testlab';
import {HasMany} from 'loopback-datasource-juggler';

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
  let customerAuthoredReviewsRepo: HasManyRepository<Review>;
  let customerOwnedReviewsRepo: HasManyRepository<Review>;
  let existingCustomerId: number;

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepositories);
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
    const authoredReview = await customerAuthoredReviewsRepo.create({
      description: 'review 1',
    });

    const ownedReview = await customerOwnedReviewsRepo.create({
      description: 'review 2',
    });

    const persistedAuthoredReviews = await reviewRepo.find({
      where: {
        authorId: existingCustomerId,
      },
    });
    const persistedOwnedReviews = await reviewRepo.find({
      where: {
        ownerId: existingCustomerId + 1,
      },
    });

    let reviews = await customerAuthoredReviewsRepo.find();
    expect(reviews).to.deepEqual(persistedAuthoredReviews);
    reviews = await customerOwnedReviewsRepo.find();
    expect(reviews).to.deepEqual(persistedOwnedReviews);
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
    ownerId: number;

    static definition = new ModelDefinition({
      name: 'Review',
      properties: {
        id: {type: 'number', id: true},
        description: {type: 'string', required: true},
        authorId: {type: 'number', required: false},
        ownerId: {type: 'number', required: false},
      },
    });
  }

  class Customer extends Entity {
    id: number;
    name: string;
    orders: Order[];
    reviewsAuthored: Review[];
    reviewsOwned: Review[];

    static definition = new ModelDefinition({
      name: 'Customer',
      properties: {
        id: {type: 'number', id: true},
        name: {type: 'string', required: true},
        orders: {type: Order, array: true},
        reviewsAuthored: {type: Review, array: true},
        reviewsOwned: {type: Review, array: true},
      },
    });

    static relations = {
      orders: {
        type: RelationType.hasMany,
        keyTo: 'customerId',
        keyFrom: 'id',
      },
      reviewsAuthored: {
        type: RelationType.hasMany,
        keyTo: 'authorId',
        keyFrom: 'id',
      },
      reviewsOwned: {
        type: RelationType.hasMany,
        keyTo: 'ownerId',
        keyFrom: 'id',
      },
    };
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
    const orderFactoryFn = createHasManyRepositoryFactory(
      Customer.relations.orders as HasManyDefinition,
      orderRepo,
    );
    const authoredReviewFactoryFn = createHasManyRepositoryFactory(
      Customer.relations.reviewsAuthored as HasManyDefinition,
      reviewRepo,
    );

    const ownedReviewsFactoryFn = createHasManyRepositoryFactory(
      Customer.relations.reviewsOwned as HasManyDefinition,
      reviewRepo,
    );

    customerAuthoredReviewsRepo = authoredReviewFactoryFn({
      id: existingCustomerId,
    });

    customerOwnedReviewsRepo = ownedReviewsFactoryFn({
      id: existingCustomerId + 1,
    });

    customerOrderRepo = orderFactoryFn({id: existingCustomerId});
  }
});
