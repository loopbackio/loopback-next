---
lang: en
title: 'belongsTo Relation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/BelongsTo-relation.html
---

## Overview

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
import {Customer, Order} from '../models';
import {CustomerRepository} from '../repositories';

export class OrderRepository extends DefaultCrudRepository<
  Order,
  typeof Order.prototype.id
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
[API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#BelongsToAccessor)

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
    return await this.orderRepository.customer(orderId);
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

  @belongsTo(() => Category)
  parentId: number;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}
```

The `CategoryRepository` must be declared like below

```ts
export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id
> {
  public readonly parent: BelongsToAccessor<Category, number>;
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Category, dataSource);
    this.parent = this._createBelongsToAccessorFor(
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
