---
lang: en
title: 'hasMany Relation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/HasMany-relation.html
---

## Overview

A `hasMany` relation denotes a one-to-many connection of a model to another
model through referential integrity. The referential integrity is enforced by a
foreign key constraint on the target model which usually references a primary
key on the source model. This relation indicates that each instance of the
declaring or source model has zero or more instances of the target model. For
example, in an application with customers and orders, a customer can have many
orders as illustrated in the diagram below.

![hasMany relation illustration](./imgs/hasMany-relation-example.png)

The diagram shows target model **Order** has property **customerId** as the
foreign key to reference the declaring model **Customer's** primary key **id**.

To add a `hasMany` relation to your LoopBack application and expose its related
routes, you need to perform the following steps:

1.  Add a property to your model to access related model instances.
2.  Modify the source model repository class to provide access to a constrained
    target model repository.
3.  Call the constrained target model repository CRUD APIs in your controller
    methods.

## Defining a hasMany Relation

This section describes how to define a `hasMany` relation at the model level
using the `@hasMany` decorator. The relation constrains the target repository by
the foreign key property on its associated model. The following example shows
how to define a `hasMany` relation on a source model `Customer`.

{% include code-caption.html content="/src/models/customer.model.ts" %}

```ts
import {Order} from './order.model.ts';
import {Entity, property, hasmany} from '@loopback/repository';

export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @hasMany(() => Order)
  orders?: Order[];

  constructor(data: Partial<Customer>) {
    super(data);
  }
}
```

The definition of the `hasMany` relation is inferred by using the `@hasMany`
decorator. The decorator takes in a function resolving the target model class
constructor and optionally a custom foreign key to store the relation metadata.
The decorator logic also designates the relation type and tries to infer the
foreign key on the target model (`keyTo` in the relation metadata) to a default
value (source model name appended with `id` in camel case, same as LoopBack 3).
It also calls `property.array()` to ensure that the type of the property is
inferred properly as an array of the target model instances.

The decorated property name is used as the relation name and stored as part of
the source model definition's relation metadata. The property type metadata is
also preserved as an array of type `Order` as part of the decoration.

A usage of the decorator with a custom foreign key name for the above example is
as follows:

```ts
// import statements
class Customer extends Entity {
  // constructor, properties, etc.
  @hasMany(() => Order, {keyTo: 'custId'})
  orders?: Order[];
}
```

## Configuring a hasMany relation

The configuration and resolution of a `hasMany` relation takes place at the
repository level. Once `hasMany` relation is defined on the source model, then
there are a couple of steps involved to configure it and use it. On the source
repository, the following are required:

- In the constructor of your source repository class, use
  [Dependency Injection](Dependency-injection.md) to receive a getter function
  for obtaining an instance of the target repository. _Note: We need a getter
  function instead of a repository instance in order to break a cyclic
  dependency between a repository with a hasMany relation and a repository with
  the matching belongsTo relation._
- Declare a property with the factory function type
  `HasManyRepositoryFactory<targetModel, typeof sourceModel.prototype.id>` on
  the source repository class.
- call the `_createHasManyRepositoryFactoryFor` function in the constructor of
  the source repository class with the relation name (decorated relation
  property on the source model) and target repository instance and assign it the
  property mentioned above.

The following code snippet shows how it would look like:

{% include code-caption.html
content="/src/repositories/customer.repository.ts.ts" %}

```ts
import {Order, Customer} from '../models';
import {OrderRepository} from './order.repository.ts';
import {
  DefaultCrudRepository,
  juggler,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {inject, Getter} from '@loopback/core';

class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public readonly orders: HasManyRepositoryFactory<
    Order,
    typeof Customer.prototype.id
  >;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter(OrderRepository)
    getOrderRepository: Getter<OrderRepository>,
  ) {
    super(Customer, db);
    this.orders = this._createHasManyRepositoryFactoryFor(
      'orders',
      getOrderRepository,
    );
  }
}
```

The following CRUD APIs are now available in the constrained target repository
factory `orders` for instances of `customerRepository`:

- `create` for creating a target model instance belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyRepository.prototype.create))
- `find` finding target model instance(s) belonging to customer model instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyRepository.prototype.find))
- `delete` for deleting target model instance(s) belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyRepository.prototype.delete))
- `patch` for patching target model instance(s) belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyRepository.prototype.patch))

## Using hasMany constrained repository in a controller

The same pattern used for ordinary repositories to expose their CRUD APIs via
controller methods is employed for `hasMany` repositories. Once the hasMany
relation has been defined and configured, controller methods can call the
underlying constrained repository CRUD APIs and expose them as routes once
decorated with
[Route decorators](Routes.md#using-route-decorators-with-controller-methods). It
will require the value of the foreign key and, depending on the request method,
a value for the target model instance as demonstrated below.

{% include code-caption.html
content="src/controllers/customer-orders.controller.ts" %}

```ts
import {post, param, requestBody} from '@loopback/rest';
import {CustomerRepository} from '../repositories/';
import {Customer, Order} from '../models/';
import {repository} from '@loopback/repository';

export class CustomerOrdersController {
  constructor(
    @repository(CustomerRepository)
    protected customerRepository: CustomerRepository,
  ) {}

  @post('/customers/{id}/order')
  async createOrder(
    @param.path.number('id') customerId: typeof Customer.prototype.id,
    @requestBody() orderData: Order,
  ): Promise<Order> {
    return await this.customerRepository.orders(customerId).create(orderData);
  }
}
```

In LoopBack 3, the REST APIs for relations were exposed using static methods
with the name following the pattern `__{methodName}__{relationName}__` (e.g.
`Customer.__find__orders`). We recommend to create a new controller for each
relation in LoopBack 4. First, it keeps controller classes smaller. Second, it
creates a logical separation of ordinary repositories and relational
repositories and thus the controllers which use them. Therefore, as shown above,
don't add order-related methods to `CustomerController`, but instead create a
new `CustomerOrdersController` class for them.

{% include note.html content="
The type of `orderData` above will possibly change to `Partial<Order>` to exclude
certain properties from the JSON/OpenAPI spec schema built for the `requestBody`
payload. See its [GitHub
issue](https://github.com/strongloop/loopback-next/issues/1179) to follow the discussion.
" %}
