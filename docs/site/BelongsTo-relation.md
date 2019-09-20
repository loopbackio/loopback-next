---
lang: en
title: 'belongsTo Relation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/BelongsTo-relation.html
---

## Overview

{% include note.html content="
This relation best works with databases that support foreign key
constraints (SQL).
Using this relation with NoSQL databases will result in unexpected behavior,
such as the ability to create a relation with a model that does not exist. We are [working on a solution](https://github.com/strongloop/loopback-next/issues/2341) to better handle this. It is fine to use this relation with NoSQL databases for purposes such as navigating
related models, where the referential integrity is not critical.
" %}

A `belongsTo` relation denotes a many-to-one connection of a model to another
model through referential integrity. The referential integrity is enforced by a
foreign key constraint on the source model which usually references a primary
key on the target model. This relation indicates that each instance of the
declaring or source model belongs to exactly one instance of the target model.
For example, in an application with customers and orders, an order always
belongs to exactly one customer as illustrated in the diagram below.

![belongsTo relation illustration](./imgs/hasMany-relation-example.png)

The diagram shows the declaring (source) model **Order** has property
**customerId** as the foreign key to reference the target model **Customer's**
primary key **id**.

To add a `belongsTo` relation to your LoopBack application and expose its
related routes, you need to perform the following steps:

1. Add a property to your source model to define the foreign key.
2. Modify the source model repository class to provide an accessor function for
   obtaining the target model instance.
3. Call the accessor function in your controller methods.

## Defining a belongsTo Relation

This section describes how to define a `belongsTo` relation at the model level
using the `@belongsTo` decorator to define the constraining foreign key.

{% include code-caption.html content="/src/models/order.model.ts" %}

```ts
import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Customer} from './customer.model';

@model()
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @belongsTo(() => Customer)
  customerId: number;

  @property({type: 'number'})
  quantity: number;

  constructor(data: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
```

The definition of the `belongsTo` relation is inferred by using the `@belongsTo`
decorator. The decorator takes in a function resolving the target model class
constructor and designates the relation type. It also calls `property()` to
ensure that the decorated property is correctly defined.

A usage of the decorator with a custom primary key of the target model for the
above example is as follows:

```ts
class Order extends Entity {
  // constructor, properties, etc.
  @belongsTo(() => Customer, {keyTo: 'pk'})
  customerId: number;
}

export interface OrderRelations {
  customer?: CustomerWithRelations;
}
```

## Configuring a belongsTo relation

The configuration and resolution of a `belongsTo` relation takes place at the
repository level. Once `belongsTo` relation is defined on the source model, then
there are a couple of steps involved to configure it and use it. On the source
repository, the following are required:

- In the constructor of your source repository class, use
  [Dependency Injection](Dependency-injection.md) to receive a getter function
  for obtaining an instance of the target repository. _Note: We need a getter
  function, accepting a string repository name instead of a repository
  constructor, or a repository instance, in order to break a cyclic dependency
  between a repository with a belongsTo relation and a repository with the
  matching hasMany relation._
- Declare a property with the factory function type
  `BelongsToAccessor<targetModel, typeof sourceModel.prototype.id>` on the
  source repository class.
- call the `createBelongsToAccessorFor` function in the constructor of the
  source repository class with the relation name (decorated relation property on
  the source model) and target repository instance and assign it the property
  mentioned above.

The following code snippet shows how it would look like:

{% include code-caption.html
content="/src/repositories/order.repository.ts" %}

```ts
import {Getter, inject} from '@loopback/context';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '@loopback/repository';
import {Customer, Order, OrderRelations} from '../models';
import {CustomerRepository} from '../repositories';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id,
  OrderRelations
> {
  public readonly customer: BelongsToAccessor<
    Customer,
    typeof Order.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('CustomerRepository')
    customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Order, db);
    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );
  }
}
```

`BelongsToAccessor` is a function accepting the primary key (id) of a source
model instance (e.g. `order.id`) and returning back the related target model
instance (e.g. a `Customer` the order belongs to). See also
[API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.belongstoaccessor.html)

## Using BelongsToAccessor in a controller

The same pattern used for ordinary repositories to expose their CRUD APIs via
controller methods is employed for `belongsTo` relation too. Once the belongsTo
relation has been defined and configured, a new controller method can expose the
accessor API as a new endpoint.

{% include code-caption.html content="src/controllers/order.controller.ts" %}

```ts
import {repository} from '@loopback/repository';
import {get} from '@loopback/rest';
import {Customer, Order} from '../models/';
import {OrderRepository} from '../repositories/';

export class OrderController {
  constructor(
    @repository(OrderRepository) protected orderRepository: OrderRepository,
  ) {}

  // (skipping regular CRUD methods for Order)

  @get('/orders/{id}/customer')
  async getCustomer(
    @param.path.number('id') orderId: typeof Order.prototype.id,
  ): Promise<Customer> {
    return this.orderRepository.customer(orderId);
  }
}
```

In LoopBack 3, the REST APIs for relations were exposed using static methods
with the name following the pattern `__{methodName}__{relationName}__` (e.g.
`Order.__get__customer`). While we recommend to create a new controller for each
hasMany relation in LoopBack 4, we also think it's best to use the main CRUD
controller as the place where to explose `belongsTo` API.

## Handling recursive relations

Given an e-commerce system has many `Category`, each `Category` may have several
sub-categories, and may belong to 1 parent-category.

```ts
export class Category extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @hasMany(() => Category, {keyTo: 'parentId'})
  categories?: Category[];

  @belongsTo(() => Category)
  parentId?: number;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  categories?: CategoryWithRelations[];
  parent?: CategoryWithRelations;
}

export type CategoryWithRelations = Category & CategoryRelations;
```

The `CategoryRepository` must be declared like below

```ts
export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  public readonly parent: BelongsToAccessor<
    Category,
    typeof Category.prototype.id
  >;
  public readonly categories: HasManyRepositoryFactory<
    Category,
    typeof Category.prototype.id
  >;

  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Category, dataSource);
    this.categories = this.createHasManyRepositoryFactoryFor(
      'categories',
      Getter.fromValue(this),
    );
    this.parent = this.createBelongsToAccessorFor(
      'parent',
      Getter.fromValue(this),
    ); // for recursive relationship
  }
}
```

DO NOT declare
`@repository.getter(CategoryRepository) protected categoryRepositoryGetter: Getter<CategoryRepository>`
on constructor to avoid "Circular dependency" error (see
[issue #2118](https://github.com/strongloop/loopback-next/issues/2118))

## Querying related models

LoopBack 4 has the concept of an `inclusion resolver` in relations, which helps
to query data through an `include` filter. An inclusion resolver is a function
that can fetch target models for the given list of source model instances.
LoopBack 4 creates a different inclusion resolver for each relation type.

The following is an example for using BelongsTo inclusion resolvers:

Use the relation between `Customer` and `Order` we show above, an `Order`
belongs to a `Customer`.

After setting up the relation in the repository class, the inclusion resolver
allows users to retrieve all orders along with their related customers through
the following code:

```ts
orderRepo.find({include: [{relation: 'customer'}]});
```

### Enable/disable the inclusion resolvers:

- Base repository classes have a public property `inclusionResolvers`, which
  maintains a map containing inclusion resolvers for each relation.
- The `inclusionResolver` of a certain relation is built when the source
  repository class calls the `createBelongsToAccessorFor` function in the
  constructor with the relation name.
- Call `registerInclusionResolver` to add the resolver of that relation to the
  `inclusionResolvers` map. (As we realized in LB3, not all relations are
  allowed to be traversed. Users can decide to which resolvers can be added.)
  The first parameter is the name of the relation.

The following code snippet shows how to register the inclusion resolver for the
belongsTo relation 'customer':

```ts
export class OrderRepository extends DefaultCrudRepository {
  customer: BelongsToAccessor<Customer, typeof Order.prototype.id>;

  constructor(
    dataSource: juggler.DataSource,
    customerRepositoryGetter: Getter<CustomerRepository>,
  ) {
    super(Order, dataSource);

    // we already have this line to create a BelongsToRepository factory
    this.customer = this.createBelongsToAccessorFor(
      'customer',
      customerRepositoryGetter,
    );

    // add this line to register inclusion resolver.
    this.registerInclusion('customer', this.customer.inclusionResolver);
  }
}
```

- We can simply include the relation in queries via `find()`, `findOne()`, and
  `findById()` methods. Example:

  ```ts
  orderRepository.find({include: [{relation: 'customer'}]});
  ```

  which returns:

  ```ts
  [
    {
      id: 1,
      description: 'Mjolnir',
      customerId: 1,
      customer: {
        id: 12,
        name: 'Thor',
      },
    },
    {
      id: 2,
      description: 'Shield',
      customer: {
        id: 10,
        name: 'Captain',
      },
    },
    {
      id: 3,
      description: 'Rocket Raccoon',
      customerId: 1,
      customer: {
        id: 12,
        name: 'Thor',
      },
    },
  ];
  ```

- You can delete a relation from `inclusionResolvers` to disable the inclusion
  for a certain relation. e.g
  `orderRepository.inclusionResolvers.delete('customer')`

{% include note.html content="
Inclusion with custom scope:
Besides specifying the relation name to include, it's also possible to specify additional scope constraints.
However, this feature is not supported yet. Check our GitHub issue for more information:
[Include related models with a custom scope](https://github.com/strongloop/loopback-next/issues/3453).
" %}
