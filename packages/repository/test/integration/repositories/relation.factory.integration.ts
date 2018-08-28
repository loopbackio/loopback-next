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
  HasManyAccessor,
  hasMany,
  belongsTo,
  model,
  property,
  createBelongsToFactory,
  BelongsToDefinition,
} from '../../..';
import {expect} from '@loopback/testlab';
import {createGetter} from '../../test-utils';

// Given a Customer and Order models - see definitions at the bottom
let db: juggler.DataSource;
let customerRepo: EntityCrudRepository<Customer, typeof Customer.prototype.id>;
let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
let reviewRepo: EntityCrudRepository<Review, typeof Review.prototype.id>;
let customerOrderRepo: HasManyRepository<Order>;
let customerAuthoredReviewFactoryFn: HasManyAccessor<
  Review,
  typeof Customer.prototype.id
>;
let customerApprovedReviewFactoryFn: HasManyAccessor<
  Review,
  typeof Customer.prototype.id
>;
let existingCustomerId: number;

describe('HasMany relation', () => {
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

  context('createHasManyRepositoryFactory', () => {
    it('resolves belongsTo metadata', () => {
      @model()
      class Card extends Entity {
        @property({id: true})
        id: number;
        @belongsTo(() => Suite)
        suiteId: string;
      }

      @model()
      class Suite extends Entity {
        @property({id: true})
        id: string;
        @hasMany(() => Card)
        cards: Card[];
      }

      const hasManyMeta = Suite.definition.relations.cards as HasManyDefinition;
      expect(hasManyMeta).to.eql({
        type: RelationType.hasMany,
        target: () => Card,
      });
      createHasManyRepositoryFactory(
        hasManyMeta,
        createGetter(
          new DefaultCrudRepository(
            Suite,
            new juggler.DataSource({connector: 'memory'}),
          ),
        ),
      );
      expect(hasManyMeta).to.eql({
        type: RelationType.hasMany,
        target: () => Card,
        keyTo: 'suiteId',
      });
    });
  });
});

describe('belongsTo relation', () => {
  it('can find an instance of the related model', async () => {
    const findCustomerOfOrder = createBelongsToFactory(
      Order.definition.relations.customerId as BelongsToDefinition,
      createGetter(customerRepo),
      orderRepo,
    );

    const customer = await customerRepo.create({name: 'Order McForder'});
    const order = await orderRepo.create({
      customerId: customer.id,
      description: 'Order from Order McForder, the hoarder of Mordor',
    });
    const result = await findCustomerOfOrder(order.id);
    expect(result).to.deepEqual(customer);
  });

  context('createBelongsToFactory', () => {
    it('errors when keyFrom is not available from belongsTo metadata', () => {
      class SomeClass extends Entity {}
      const keyFromLessMeta: BelongsToDefinition = {
        type: RelationType.belongsTo,
        target: () => SomeClass,
        keyTo: 'someKey',
      };
      expect(() =>
        createBelongsToFactory(
          keyFromLessMeta,
          createGetter(reviewRepo),
          orderRepo,
        ),
      ).to.throw(/The foreign key property name \(keyFrom\) must be specified/);
    });

    it('resolves property id metadata', () => {
      @model()
      class Card extends Entity {
        @property({id: true})
        id: number;
        @belongsTo(() => Suite)
        suiteId: string;
      }

      @model()
      class Suite extends Entity {
        @property({id: true})
        id: string;
        cards: Card[];
      }

      const belongsToMeta = Card.definition.relations
        .suiteId as BelongsToDefinition;
      expect(belongsToMeta).to.eql({
        type: RelationType.belongsTo,
        target: () => Suite,
        keyFrom: 'suiteId',
      });
      createBelongsToFactory(
        belongsToMeta,
        createGetter(
          new DefaultCrudRepository(
            Suite,
            new juggler.DataSource({connector: 'memory'}),
          ),
        ),
        new DefaultCrudRepository(
          Card,
          new juggler.DataSource({connector: 'memory'}),
        ),
      );
      expect(belongsToMeta).to.eql({
        type: RelationType.belongsTo,
        target: () => Suite,
        keyFrom: 'suiteId',
        keyTo: 'id',
      });
    });
  });
});

//--- HELPERS ---//

class Order extends Entity {
  id: number;
  description: string;
  customerId: number;

  static definition: ModelDefinition = new ModelDefinition({
    name: 'Order',
    properties: {
      id: {type: 'number', id: true},
      description: {type: 'string', required: true},
      customerId: {type: 'number', required: true},
    },
    relations: {
      customerId: {
        type: RelationType.belongsTo,
        target: () => Customer,
        keyFrom: 'customerId',
        keyTo: 'id',
      },
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
    relations: {
      orders: {
        type: RelationType.hasMany,
        target: () => Order,
        keyTo: 'customerId',
      },
      reviewsAuthored: {
        type: RelationType.hasMany,
        target: () => Review,
        keyTo: 'authorId',
      },
      reviewsApproved: {
        type: RelationType.hasMany,
        target: () => Review,
        keyTo: 'approvedId',
      },
    },
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
    createGetter(orderRepo),
  );

  customerOrderRepo = orderFactoryFn(existingCustomerId);
}

function givenRepositoryFactoryFunctions() {
  customerAuthoredReviewFactoryFn = createHasManyRepositoryFactory(
    Customer.definition.relations.reviewsAuthored as HasManyDefinition,
    createGetter(reviewRepo),
  );
  customerApprovedReviewFactoryFn = createHasManyRepositoryFactory(
    Customer.definition.relations.reviewsApproved as HasManyDefinition,
    createGetter(reviewRepo),
  );
}
