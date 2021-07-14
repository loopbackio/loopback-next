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
} from '../../..';

// Given a Customer and Order models - see definitions at the bottom
let db: juggler.DataSource;
let customerRepo: EntityCrudRepository<Customer, typeof Customer.prototype.id>;
let orderRepo: EntityCrudRepository<Order, typeof Order.prototype.id>;
let cartItemRepo: EntityCrudRepository<CartItem, typeof CartItem.prototype.id>;
let customerCartItemLinkRepo: EntityCrudRepository<
  CustomerCartItemLink,
  typeof CustomerCartItemLink.prototype.id
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

describe('HasManyThrough relation', () => {
  let existingCustomerId: number;
  // Customer has many CartItems through CustomerCartItemLink
  let customerCartItemRepo: HasManyThroughRepository<
    CartItem,
    typeof CartItem.prototype.id,
    CustomerCartItemLink
  >;
  let customerCartItemFactory: HasManyThroughRepositoryFactory<
    CartItem,
    typeof CartItem.prototype.id,
    CustomerCartItemLink,
    typeof Customer.prototype.id
  >;

  before(givenCrudRepositories);
  before(givenPersistedCustomerInstance);
  before(givenConstrainedRepositories);

  beforeEach(async function resetDatabase() {
    await customerRepo.deleteAll();
    await customerCartItemLinkRepo.deleteAll();
    await cartItemRepo.deleteAll();
  });

  it('creates a target instance along with the corresponding through model', async () => {
    const cartItem = await customerCartItemRepo.create({
      description: 'an item hasManyThrough',
    });
    const persistedItem = await cartItemRepo.findById(cartItem.id);
    const persistedLink = await customerCartItemLinkRepo.find();

    expect(cartItem).to.deepEqual(persistedItem);
    expect(persistedLink).have.length(1);
    const expected = {
      customerId: existingCustomerId,
      itemId: cartItem.id,
    };
    expect(toJSON(persistedLink[0])).to.containEql(toJSON(expected));
  });

  it('finds an instance via through model', async () => {
    const item = await customerCartItemRepo.create({
      description: 'an item hasManyThrough',
    });
    const notMyItem = await cartItemRepo.create({
      description: "someone else's item desc",
    });

    const items = await customerCartItemRepo.find();

    expect(items).to.not.containEql(notMyItem);
    expect(items).to.deepEqual([item]);
  });

  it('finds instances via through models', async () => {
    const item1 = await customerCartItemRepo.create({description: 'group 1'});
    const item2 = await customerCartItemRepo.create({
      description: 'group 2',
    });
    const items = await customerCartItemRepo.find();

    expect(items).have.length(2);
    expect(items).to.deepEqual([item1, item2]);
    const group1 = await customerCartItemRepo.find({
      where: {description: 'group 1'},
    });
    expect(group1).to.deepEqual([item1]);
  });

  it('deletes an instance, then deletes the through model', async () => {
    await customerCartItemRepo.create({
      description: 'customer 1',
    });
    const anotherHasManyThroughRepo = customerCartItemFactory(
      existingCustomerId + 1,
    );
    const item2 = await anotherHasManyThroughRepo.create({
      description: 'customer 2',
    });
    let items = await cartItemRepo.find();
    let links = await customerCartItemLinkRepo.find();

    expect(items).have.length(2);
    expect(links).have.length(2);

    await customerCartItemRepo.delete();
    items = await cartItemRepo.find();
    links = await customerCartItemLinkRepo.find();

    expect(items).have.length(1);
    expect(links).have.length(1);
    expect(items).to.deepEqual([item2]);
    expect(links[0]).has.property('itemId', item2.id);
    expect(links[0]).has.property('customerId', existingCustomerId + 1);
  });

  it('deletes through model when corresponding target gets deleted', async () => {
    const item1 = await customerCartItemRepo.create({
      description: 'customer 1',
    });
    const anotherHasManyThroughRepo = customerCartItemFactory(
      existingCustomerId + 1,
    );
    const item2 = await anotherHasManyThroughRepo.create({
      description: 'customer 2',
    });
    // when order1 gets deleted, this through instance should be deleted too.
    const through = await customerCartItemLinkRepo.create({
      id: 1,
      customerId: existingCustomerId + 1,
      itemId: item1.id,
    });
    let items = await cartItemRepo.find();
    let links = await customerCartItemLinkRepo.find();

    expect(items).have.length(2);
    expect(links).have.length(3);

    await customerCartItemRepo.delete();

    items = await cartItemRepo.find();
    links = await customerCartItemLinkRepo.find();

    expect(items).have.length(1);
    expect(links).have.length(1);
    expect(items).to.deepEqual([item2]);
    expect(links).to.not.containEql(through);
    expect(links[0]).has.property('itemId', item2.id);
    expect(links[0]).has.property('customerId', existingCustomerId + 1);
  });

  it('deletes instances based on the filter', async () => {
    await customerCartItemRepo.create({
      description: 'customer 1',
    });
    const item2 = await customerCartItemRepo.create({
      description: 'customer 2',
    });

    let items = await cartItemRepo.find();
    let links = await customerCartItemLinkRepo.find();
    expect(items).have.length(2);
    expect(links).have.length(2);

    await customerCartItemRepo.delete({description: 'does not exist'});
    items = await cartItemRepo.find();
    links = await customerCartItemLinkRepo.find();
    expect(items).have.length(2);
    expect(links).have.length(2);

    await customerCartItemRepo.delete({description: 'customer 1'});
    items = await cartItemRepo.find();
    links = await customerCartItemLinkRepo.find();

    expect(items).have.length(1);
    expect(links).have.length(1);
    expect(items).to.deepEqual([item2]);
    expect(links[0]).has.property('itemId', item2.id);
    expect(links[0]).has.property('customerId', existingCustomerId);
  });

  it('patches instances that belong to the same source model (same source fk)', async () => {
    const item1 = await customerCartItemRepo.create({
      description: 'group 1',
    });
    const item2 = await customerCartItemRepo.create({
      description: 'group 1',
    });

    const count = await customerCartItemRepo.patch({description: 'group 2'});
    expect(count).to.match({count: 2});
    const updateResult = await cartItemRepo.find();
    expect(toJSON(updateResult)).to.containDeep(
      toJSON([
        {id: item1.id, description: 'group 2'},
        {id: item2.id, description: 'group 2'},
      ]),
    );
  });

  it('links a target instance to the source instance', async () => {
    const item = await cartItemRepo.create({description: 'an item'});
    let targets = await customerCartItemRepo.find();
    expect(targets).to.deepEqual([]);

    await customerCartItemRepo.link(item.id);
    targets = await customerCartItemRepo.find();
    expect(toJSON(targets)).to.containDeep(toJSON([item]));
    const link = await customerCartItemLinkRepo.find();
    expect(toJSON(link[0])).to.containEql(
      toJSON({customerId: existingCustomerId, itemId: item.id}),
    );
  });

  it('links a target instance to the source instance with specified ThroughData', async () => {
    const item = await cartItemRepo.create({description: 'an item'});

    await customerCartItemRepo.link(item.id, {
      throughData: {description: 'a through'},
    });
    const targets = await customerCartItemRepo.find();
    expect(toJSON(targets)).to.containDeep(toJSON([item]));
    const link = await customerCartItemLinkRepo.find();
    expect(toJSON(link[0])).to.containEql(
      toJSON({
        customerId: existingCustomerId,
        itemId: item.id,
        description: 'a through',
      }),
    );
  });

  it('unlinks a target instance from the source instance', async () => {
    const item = await customerCartItemRepo.create({description: 'an item'});
    let targets = await customerCartItemRepo.find();
    expect(toJSON(targets)).to.containDeep(toJSON([item]));

    await customerCartItemRepo.unlink(item.id);
    targets = await customerCartItemRepo.find();
    expect(targets).to.deepEqual([]);
    // the through model should be deleted
    const thoughs = await customerCartItemRepo.find();
    expect(thoughs).to.deepEqual([]);
  });

  it('unlinks all targets instance from the source instance', async () => {
    const item = await customerCartItemRepo.create({description: 'an item'});
    const item1 = await customerCartItemRepo.create({
      description: 'another item',
    });
    let targets = await customerCartItemRepo.find();
    expect(toJSON(targets)).to.containDeep(toJSON([item, item1]));

    await customerCartItemRepo.unlinkAll();
    targets = await customerCartItemRepo.find();
    expect(targets).to.deepEqual([]);
    // the through model should be deleted
    const thoughs = await customerCartItemRepo.find();
    expect(thoughs).to.deepEqual([]);
  });
  //--- HELPERS ---//

  async function givenPersistedCustomerInstance() {
    const customer = await customerRepo.create({name: 'a customer'});
    existingCustomerId = customer.id;
  }

  function givenConstrainedRepositories() {
    customerCartItemFactory = createHasManyThroughRepositoryFactory<
      CartItem,
      typeof CartItem.prototype.id,
      CustomerCartItemLink,
      typeof CustomerCartItemLink.prototype.id,
      typeof Customer.prototype.id
    >(
      {
        name: 'cartItems',
        type: 'hasMany',
        targetsMany: true,
        source: Customer,
        keyFrom: 'id',
        target: () => CartItem,
        keyTo: 'id',
        through: {
          model: () => CustomerCartItemLink,
          keyFrom: 'customerId',
          keyTo: 'itemId',
        },
      } as HasManyDefinition,
      Getter.fromValue(cartItemRepo),
      Getter.fromValue(customerCartItemLinkRepo),
    );

    customerCartItemRepo = customerCartItemFactory(existingCustomerId);
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
    .addProperty('customerId', {type: 'number', required: true})
    .belongsTo('customer', {
      source: Order,
      target: () => Customer,
    });
}

class CartItem extends Entity {
  id: number;
  description: string;

  static definition = new ModelDefinition('CartItem')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('description', {type: 'string', required: true});
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
    .hasMany('orders', {
      source: Customer,
      target: () => Order,
      keyTo: 'customerId',
    })
    .hasMany('reviewsAuthored', {
      source: Customer,
      target: () => Review,
      keyTo: 'authorId',
    })
    .hasMany('reviewsApproved', {
      source: Customer,
      target: () => Review,
      keyTo: 'approvedId',
    });
}

class CustomerCartItemLink extends Entity {
  id: number;
  customerId: number;
  itemId: number;
  description: string;
  static definition = new ModelDefinition('CustomerCartItemLink')
    .addProperty('id', {type: 'number', id: true})
    .addProperty('itemId', {type: 'number'})
    .addProperty('customerId', {type: 'number'})
    .addProperty('description', {type: 'string'});
}
function givenCrudRepositories() {
  db = new juggler.DataSource({connector: 'memory'});

  customerRepo = new DefaultCrudRepository(Customer, db);
  orderRepo = new DefaultCrudRepository(Order, db);
  cartItemRepo = new DefaultCrudRepository(CartItem, db);
  customerCartItemLinkRepo = new DefaultCrudRepository(
    CustomerCartItemLink,
    db,
  );
  reviewRepo = new DefaultCrudRepository(Review, db);
}
