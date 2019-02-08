---
lang: en
title: 'hasManyThrough Relation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/HasMany-relation.html
---

{% include important.html content="The underlying implementation may change in the near future.
If some of the changes break backward-compatibility a semver-major may not
be released.
" %}

## Overview

A `hasManyThrough` relation sets up a many-to-many connection with another model. This relation indicates that the declaring model can be matched with zero or more instances of another model by proceeding through a third model. For example, in an application for a medical practice where patients make appointments to see physicians, the relevant relation declarations might be:

![hasManyThrough relation illustration](./imgs/hasManyThrough-relation-example.png)

The `through` model, Appointment, has two foreign key properties, physicianId and patientId, that reference the primary keys in the declaring model, Physician, and the target model, Patient.

## Defining a hasManyThrough Relation

A `hasManyThrough` relation is defined in a model using the `@hasMany` decorator.

The following example shows how to define a `hasManyThrough` between a `Customer` and `Seller`
model through an `Order` model.

_models/customer.model.ts_
```ts
import {Entity, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import {Seller} from './seller.model';

export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @hasMany(() => Seller, {through: () => Order})
  sellers?: Seller[];

  constructor(data: Partial<Customer>) {
    super(data);
  }
}
```

_models/seller.model.ts_
```ts
import {Entity, property, hasMany} from '@loopback/repository';
import {Order} from './order.model';
import {Customer} from './customer.model';

export class Seller extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @hasMany(() => Customer, {through: () => Order})
  customers?: Customer[];

  constructor(data: Partial<Seller>) {
    super(data);
  }
}
```

_models/order.model.ts_
```ts
import {Entity, property, belongsTo} from '@loopback/repository';
import {Customer} from './customer.model';
import {Seller} from './seller.model';

export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @belongsTo(() => Customer)
  customerId?: number;

  @belongsTo(() => Seller)
  sellerId?: number;

  constructor(data: Partial<Order>) {
    super(data);
  }
}
```

The definition of the `hasManyThrough` relation is inferred by using the `@hasMany`
decorator with a `through` property. The decorator takes in a function resolving
the target model class constructor. The `through` property takes in a function
resolving the through model class constructor.

The decorated property name is used as the relation name and stored as part of
the source model definition's relation metadata. The property type metadata is
also preserved as an array of type `Seller` as part of the decoration.

## Configuring a hasManyThrough relation

The configuration and resolution of a `hasManyThrough` relation takes place at the
repository level. Once the `hasManyThrough` relation is defined on the source model,
then there are a couple of steps involved to configure it and use it. On the source
repository, the following are required:

- In the constructor of your source repository class, use
  [Dependency Injection](Dependency-injection.md) to receive a getter function
  for obtaining an instance of the target repository and an instance of the
  through repository. _Note: We need a getter function, accepting a string
  repository name instead of a repository constructor, or a repository instance,
  in order to break a cyclic dependency between two repositories referencing
  eachother with a hasManyThrough relation._

- Declare a property with the factory function type
  `HasManyThroughRepositoryFactory<targetModel, throughModel, typeof sourceModel.prototype.id>`
  on the source repository class.
- call the `createHasManyThroughRepositoryFactoryFor` function in the constructor of
  the source repository class with the relation name (decorated relation
  property on the source model), target repository instance and through repository instance
  and assign it the property mentioned above.

_repositories/customer.repository.ts_
```ts
import {Order, Customer, Seller} from '../models';
import {OrderRepository, SellerRepository} from './order.repository';
import {
  DefaultCrudRepository,
  juggler,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {inject, Getter} from '@loopback/core';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id
> {
  public readonly sellers: HasManyThroughRepositoryFactory<
    Seller,
    Order,
    typeof Customer.prototype.id
  >;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('SellerRepository')
    getSellerRepository: Getter<SellerRepository>,
    @repository.getter('OrderRepository')
    getOrderRepository: Getter<OrderRepository>,
  ) {
    super(Customer, db);
    this.sellers = this.createHasManyThroughRepositoryFactoryFor(
      'sellers',
      getSellerRepository,
      getOrderRepository,
    );
  }
}
```

The following CRUD APIs are now available in the constrained target repository
factory `orders` for instances of `customerRepository`:

- `create` for creating a target model instance belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyThroughRepository.prototype.create))
- `find` finding target model instance(s) belonging to customer model instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyThroughRepository.prototype.find))
- `delete` for deleting target model instance(s) belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyThroughRepository.prototype.delete))
- `patch` for patching target model instance(s) belonging to customer model
  instance
  ([API Docs](https://apidocs.strongloop.com/@loopback%2fdocs/repository.html#HasManyThroughRepository.prototype.patch))

## Using hasMany constrained repository in a controller

```ts
import {post, param, requestBody} from '@loopback/rest';
import {CustomerRepository} from '../repositories/';
import {Customer, Seller} from '../models/';
import {repository} from '@loopback/repository';

export class CustomerOrdersController {
  constructor(
    @repository(CustomerRepository)
    protected customerRepository: CustomerRepository,
  ) {}

  @post('/customers/{id}/order')
  async createOrder(
    @param.path.number('id') customerId: typeof Customer.prototype.id,
    @requestBody() sellerData: Seller,
  ): Promise<Order> {
    return await this.customerRepository.sellers(customerId).create(sellerData);
  }
}
```
