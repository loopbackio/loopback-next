---
lang: en
title: 'hasOne Relation'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/HasOne-relation.html
---

## Overview

{% include note.html content="
This relation best works with databases that support foreign key and unique
constraints (SQL).
Using this relation with NoSQL databases will result in unexpected behavior,
such as the ability to create a relation with a model that does not exist. We are [working on a solution](https://github.com/strongloop/loopback-next/issues/2341) to better handle this. It is fine to use this relation with NoSQL databases for purposes such as navigating related models, where the referential integrity is not critical.
" %}

{% include note.html content="There are some limitations to `Inclusion Resolver`. See [Limitations](Relations.md#limitations)." %}

A `hasOne` relation denotes a one-to-one connection of a model to another model
through referential integrity. The referential integrity is enforced by a
foreign key constraint on both the source model and the target model which
usually references a primary key on the source model for the target model and
primary key on the target model for the source model. This relation indicates
that each instance of the declaring or source model belongs to exactly one
instance of the target model. For example, in an application with suppliers and
accounts, a supplier can have only one account as illustrated in the diagram
below.

![hasOne relation illustration](./imgs/hasOne-relation-example.png)

The diagram shows target model **Account** has property **supplierId** as the
foreign key to reference the declaring model **Supplier's** primary key **id**.

To add a `hasOne` relation to your LoopBack application and expose its related
routes, you need to perform the following steps:

1.  Add a property to your model to access related model instance.
2.  Add a foreign key property in the target model referring to the source
    model's id.
3.  Modify the source model repository class to provide access to a constrained
    target model repository.
4.  Call the constrained target model repository CRUD APIs in your controller
    methods.

## Defining a hasOne Relation

This section describes how to define a `hasOne` relation at the model level
using the `@hasOne` decorator. The relation constrains the target repository by
the foreign key property on its associated model. The following example shows
how to define a `hasOne` relation on a source model `Supplier` and a target
model `Account`.

{% include code-caption.html content="/src/models/supplier.model.ts" %}

```ts
import {Account} from './account.model';
import {Entity, property, hasOne} from '@loopback/repository';

export class Supplier extends Entity {
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

  @hasOne(() => Account)
  account?: Account;

  constructor(data: Partial<Supplier>) {
    super(data);
  }
}
```

The definition of the `hasOne` relation is inferred by using the `@hasOne`
decorator. The decorator takes in a function resolving the target model class
constructor and optionally a custom foreign key to store the relation metadata.
The decorator logic also designates the relation type and tries to infer the
foreign key on the target model (`keyTo` in the relation metadata) to a default
value (source model name appended with `Id` in camel case, same as LoopBack 3).

The decorated property name is used as the relation name and stored as part of
the source model definition's relation metadata. The property type metadata is
also preserved as a type of `Account` as part of the decoration. (Check
[Relation Metadata](HasOne-relation.md#relation-metadata) section below for more
details)

A usage of the decorator with a custom foreign key name for the above example is
as follows:

```ts
// import statements
class Supplier extends Entity {
  // constructor, properties, etc.
  @hasOne(() => Account, {keyTo: 'supplierId'})
  account?: Account;
}
```

Add the source model's id as the foreign key property (`supplierId`) in the
target model.

{% include code-caption.html content="/src/models/account.model.ts" %}

```ts
import {Entity, model, property} from '@loopback/repository';

@model()
export class Account extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
  })
  supplierId?: number;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // describe navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
```

The foreign key property (`supplierId`) in the target model can be added via a
corresponding [belongsTo](BelongsTo-relation.md) relation, too.

{% include code-caption.html content="/src/models/account.model.ts" %}

```ts
import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Supplier, SupplierWithRelations} from './supplier.model';

@model()
export class Account extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @belongsTo(() => Supplier)
  supplierId: number;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  supplier?: SupplierWithRelations;
}

export type AccountWithRelations = Account & AccountRelations;
```

LB4 also provides an CLI tool `lb4 relation` to generate `hasOne` relation for
you. Before you check out the
[`Relation Generator`](https://loopback.io/doc/en/lb4/Relation-generator.html)
page, read on to learn how you can define relations to meet your requirements.

### Relation Metadata

LB4 uses three `keyFrom`, `keyTo` and `name` fields in the `hasOne` relation
metadata to configure relations. The relation metadata has its own default
values for these three fields:

<table>
  <thead>
    <tr>
      <th width="95">Field Name</th>
      <th width="260">Description</th>
      <th width="260">Default Value</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>keyFrom</code></td>
      <td>the primary key of the source model</td>
      <td>the id property of the source model</td>
      <td><code>Supplier.id</code></td>
    </tr>
    <tr>
      <td><code>keyTo</code></td>
      <td>the foreign key of the target model</td>
      <td>the source model name appended with `Id` in camel case</td>
      <td><code>Account.supplierId</code></td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>the name of the relation</td>
      <td>decorated property name</td>
      <td><code>Supplier.account</code></td>
    </tr>

  </tbody>
</table>

We recommend to use default values. If you'd like to customize the foreign key
name, you'll need to specify some fields through the relation decorator.

For customizing the foreign key name, `keyTo` field needs to be specified via
`@hasOne` decorator. The following example shows how to customize the foreign
key name as `suppId` instead of `supplierId`:

```ts
// import statements
@model()
export class Supplier extends Entity {
  // constructor, properties, etc.

  @hasOne(() => Account, {keyTo: 'suppId'})
  account: Account;
}
```

```ts
// import statements
@model()
export class Account extends Entity {
  // constructor, properties, etc.

  @property({
    type: 'number',
  })
  suppId: number; // customized foreign key name
}
```

Notice that if you decorate the corresponding customized foreign key of the
target model with `@belongsTo`, you also need to specify the `belongsTo`
relation name in the `name` field of its relation metadata. See
[BelongsTo](BelongsTo-relation.md) for more details.

```ts
// import statements
@model()
export class Account extends Entity {
  // constructor, properties, etc.

  // specify the belongsTo relation name if a customized name is used here
  @belongsTo(() => Supplier, {name: 'supplier'}) // the name of this belongsTo relation
  suppId: number; // customized foreign key name
}
```

If you need to use another attribute other than the id property to be the source
key, customizing `keyFrom` field would allow you to do so:

```ts
export class Supplier extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  // if you'd like to use this property as the source id
  // of a certain relation that relates to a model `Review`
  @property({
    type: 'number',
  })
  authorId: number; // not primary key

  @hasOne(() => Review, {keyFrom: 'authorId'})
  review: Review;

  @hasOne(() => Account)
  account: Account;

  // ..constructor
  }
}
```

Notice that if you decorate the corresponding foreign key of the target model
with `@belongsTo`, you also need to specify the `keyTo` field of its relation
metadata. See [BelongsTo](BelongsTo-relation.md#relation-metadata) for more
details.

```ts
// import statements
@model()
export class Review extends Entity {
  // constructor, properties, etc.

  // specify the keyTo if the source key is not the id property
  @belongsTo(() => Supplier, {keyTo: 'authorId'})
  supplierId: number; // default foreign key name
}
```

{% include important.html content="It is user's responsibility to make sure the non-id source key doesn't have duplicate value. Besides, LB4 doesn't support composite keys for now. e.g joining two tables with more than one source key. Related GitHub issue: [Composite primary/foreign keys](https://github.com/strongloop/loopback-next/issues/1830)" %}

If you need to use _different names for models and database columns_, to use
`my_account` as db column name other than `account` for example, the following
setting would allow you to do so:

```ts
// import statements
@model()
export class Supplier extends Entity {
  // constructor, properties, etc.
  @hasOne(() => Account, {keyFrom: 'account'}, {name: 'my_account'})
  account: Account;
}
```

_Notice: the `name` field in the third parameter is not part of the relation
metadata. It's part of property definition._

## Configuring a hasOne relation

The configuration and resolution of a `hasOne` relation takes place at the
repository level. Once `hasOne` relation is defined on the source model, then
there are a couple of steps involved to configure it and use it. On the source
repository, the following are required:

- In the constructor of your source repository class, use
  [Dependency Injection](Dependency-injection.md) to receive a getter function
  for obtaining an instance of the target repository. _Note: We need a getter
  function, accepting a string repository name instead of a repository
  constructor, or a repository instance, in `Account` to break a cyclic
  dependency between a repository with a hasOne relation and a repository with
  the matching belongsTo relation._

- Declare a property with the factory function type
  `HasOneRepositoryFactory<targetModel, typeof sourceModel.prototype.id>` on the
  source repository class.
- call the `createHasOneRepositoryFactoryFor` function in the constructor of the
  source repository class with the relation name (decorated relation property on
  the source model) and target repository instance and assign it the property
  mentioned above.

The following code snippet shows how it would look like:

{% include code-caption.html
content="/src/repositories/supplier.repository.ts" %}

```ts
import {Account, Supplier, SupplierRelations} from '../models';
import {AccountRepository} from './account.repository';
import {
  DefaultCrudRepository,
  juggler,
  HasOneRepositoryFactory,
  repository,
} from '@loopback/repository';
import {inject, Getter} from '@loopback/core';

export class SupplierRepository extends DefaultCrudRepository<
  Supplier,
  typeof Supplier.prototype.id,
  SupplierRelations
> {
  public readonly account: HasOneRepositoryFactory<
    Account,
    typeof Supplier.prototype.id
  >;
  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('AccountRepository')
    getAccountRepository: Getter<AccountRepository>,
  ) {
    super(Supplier, db);
    this.account = this.createHasOneRepositoryFactoryFor(
      'account',
      getAccountRepository,
    );
  }
}
```

The following CRUD APIs are now available in the constrained target repository
factory `account` for instances of `SupplierRepository`:

- `create` for creating a target model instance belonging to `Supplier` model
  instance
  ([API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.hasonerepository.create.html))
- `get` gets target model instance belonging to Supplier model instance
  ([API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.hasonerepository.get.html))
- `delete` for deleting target model instance belonging to Supplier model
  instance
  ([API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.hasonerepository.delete.html))
- `patch` for patching target model instance belonging to Supplier model
  instance
  ([API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.hasonerepository.patch.html))

Here is an example of creating the related models:

```ts
const sup = await supplierRepository.create({id: 1, name: 'Tammy'});
const accountData = {id: 1, supplierId: sup.id};
// create the related account
supplierRepository.account(sup.id).create(accountData);
```

{% include note.html content="Notice that `SupplierRepository.create()` expects a `Supplier` model only, navigational properties are not expected to be included in the target data. For instance, the following request will be rejected:
`supplierRepository.create({`
`  id: 1,`
`  name:'invalid request',`
`  account:{id: 1, supplierId: 1}`
`})`" %}

For **updating** (full replace of all properties on a `PUT` endpoint for
instance) a target model you have to directly use this model repository. In this
case, the caller must provide both the foreignKey value and the primary key
(id). Since the caller already has access to the primary key of the target
model, there is no need to go through the relation repository and the operation
can be performed directly on `DefaultCrudRepository` for the target model
(`AccountRepository` in our example).

## Using hasOne constrained repository in a controller

The same pattern used for ordinary repositories to expose their CRUD APIs via
controller methods is employed for `hasOne` repositories. Once the hasOne
relation has been defined and configured, controller methods can call the
underlying constrained repository CRUD APIs and expose them as routes once
decorated with
[Route decorators](Routes.md#using-route-decorators-with-controller-methods). It
will require the value of the foreign key and, depending on the request method,
a value for the target model instance as demonstrated below.

{% include code-caption.html
content="src/controllers/supplier-account.controller.ts" %}

```ts
import {post, param, requestBody} from '@loopback/rest';
import {SupplierRepository} from '../repositories/';
import {Supplier, Account} from '../models/';
import {repository} from '@loopback/repository';

export class SupplierAccountController {
  constructor(
    @repository(SupplierRepository)
    protected supplierRepository: SupplierRepository,
  ) {}

  @post('/suppliers/{id}/account')
  async createAccount(
    @param.path.number('id') supplierId: typeof Supplier.prototype.id,
    @requestBody() accountData: Account,
  ): Promise<Account> {
    return this.supplierRepository.account(supplierId).create(accountData);
  }
}
```

In LoopBack 3, the REST APIs for relations were exposed using static methods
with the name following the pattern `__{methodName}__{relationName}__` (e.g.
`Supplier.__find__account`). We recommend to create a new controller for each
relation in LoopBack 4. First, it keeps controller classes smaller. Second, it
creates a logical separation of ordinary repositories and relational
repositories and thus the controllers which use them. Therefore, as shown above,
don't add account-related methods to `SupplierController`, but instead create a
new `SupplierAccountController` class for them.

{% include note.html content="
The type of `accountData` above will possibly change to `Partial<Account>` to exclude
certain properties from the JSON/OpenAPI spec schema built for the `requestBody`
payload. See its [GitHub
issue](https://github.com/strongloop/loopback-next/issues/1179) to follow the discussion.
" %}

## Querying related models

Different from LB3, LB4 creates a different inclusion resolver for each relation
type to query related models. Each **relation** has its own inclusion resolver
`inclusionResolver`. And each **repository** has a built-in property
`inclusionResolvers` as a registry for its inclusionResolvers. Here is a diagram
to show the idea:

![inclusion](./imgs/relation-inclusion.png)

A `hasOne` relation has an `inclusionResolver` function as a property. It
fetches target models for the given list of source model instances.

Use the relation between `Supplier` and `Account` we use above, a `Supplier` has
one `Account`.

After setting up the relation in the repository class, the inclusion resolver
allows users to retrieve all suppliers along with their related accounts through
the following code at the repository level:

```ts
supplierRepo.find({include: [{relation: 'account'}]});
```

or use APIs with controllers:

```
GET http://localhost:3000/suppliers?filter[include][][relation]=account
```

### Enable/disable the inclusion resolvers

- Base repository classes have a public property `inclusionResolvers`, which
  maintains a map containing inclusion resolvers for each relation.
- The `inclusionResolver` of a certain relation is built when the source
  repository class calls the `createHasOneRepositoryFactoryFor` function in the
  constructor with the relation name.
- Call `registerInclusionResolver` to add the resolver of that relation to the
  `inclusionResolvers` map. (As we realized in LB3, not all relations are
  allowed to be traversed. Users can decide to which resolvers can be added.)

The following code snippet shows how to register the inclusion resolver for the
has-one relation 'account':

```ts
export class SupplierRepository extends DefaultCrudRepository {
  account: HasOneRepositoryFactory<Account, typeof Supplier.prototype.id>;

  constructor(
    dataSource: juggler.DataSource,
    accountRepositoryGetter: Getter<AccountRepository>,
  ) {
    super(Supplier, dataSource);

    // we already have this line to create a HasOneRepository factory
    this.account = this.createHasOneRepositoryFactoryFor(
      'account',
      accountRepositoryGetter,
    );

    // add this line to register inclusion resolver
    this.registerInclusionResolver('account', this.account.inclusionResolver);
  }
}
```

- We can simply include the relation in queries via `find()`, `findOne()`, and
  `findById()` methods. For example, these queries return all Suppliers with
  their `Account`s:

  if you process data at the repository level:

  ```ts
  supplierRepository.find({include: [{relation: 'account'}]});
  ```

  this is the same as the url:

  ```
  GET http://localhost:3000/suppliers?filter[include][][relation]=account
  ```

  which returns:

  ```ts
  [
    {
      id: 1,
      name: 'Thor',
      account: {accountManager: 'Odin', supplierId: 1},
    },
    {
      id: 2,
      name: 'Loki',
      account: {accountManager: 'Frigga', supplierId: 5},
    },
  ];
  ```

{% include note.html content="The query syntax is a slightly different from LB3. We are also thinking about simplifying the query syntax. Check our GitHub issue for more information:
[Simpler Syntax for Inclusion](https://github.com/strongloop/loopback-next/issues/3205)" %}

Here is a diagram to make this more intuitive:

![Graph](./imgs/hasOne-relation-graph.png)

- You can delete a relation from `inclusionResolvers` to disable the inclusion
  for a certain relation. e.g
  `supplierRepository.inclusionResolvers.delete('account')`

### Query multiple relations

It is possible to query several relations or nested include relations with
custom scope. Once you have the inclusion resolver of each relation set up, the
following queries would allow you traverse data differently:

In our example, we have relations:

- `Customer` _hasOne_ an `Address` - denoted as `address`.
- `Customer` _hasMany_ `Order`s - denoted as `orders`.
- `Order` _hasMany_ `Manufacturer` - denoted as `manufacturers`.

To query **multiple relations**, for example, return all Suppliers including
their orders and address, in Node API:

```ts
customerRepo.find({include: [{relation: 'orders'}, {relation: 'address'}]});
```

Equivalently, with url, you can do:

```
GET http://localhost:3000/customers?filter[include][0][relation]=orders&filter[include][1][relation]=address
```

This gives

```ts
[
  {
    id: 1,
    name: 'Thor',
    addressId: 3
    orders: [
      {name: 'Mjolnir', customerId: 1},
      {name: 'Rocket Raccoon', customerId: 1},
    ],
    address:{
          id: 3
          city: 'Thrudheim',
          province: 'Asgard',
          zipcode: '8200',
    }
  },
  {
    id: 2,
    name: 'Captain',
    orders: [{name: 'Shield', customerId: 2}], // doesn't have a related address
  },
]
```

To query **nested relations**, for example, return all Suppliers including their
orders and include orders' manufacturers , this can be done with filter:

```ts
customerRepo.find({
  include: [
    {
      relation: 'orders',
      scope: {
        include: [{relation: 'manufacturers'}],
      },
    },
  ],
});
```

( You might use `encodeURIComponent(JSON.stringify(filter))` to convert the
filter object to a query string.)

<!-- FIXME: the url isn't being converted to JSON correctly. Add an example url once it's fixed

Equivalently, with url, you can do:

```
// need to fix this
 GET http://localhost:3000/customers?filter[include][0][relation]=orders&filter[include][0][scope]filter[include][0][relation]=manufacturers
``` -->

which gives

```ts
{
  id: 1,
  name: 'Thor',
  addressId: 3
  orders: [
    {
      name: 'Mjolnir',
      customerId: 1
    },
    {
      name: 'Rocket Raccoon',
      customerId: 1,
      manufacturers:[ // nested related models of orders
        {
          name: 'ToysRUs',
          orderId: 1
        },
                {
          name: 'ToysRThem',
          orderId: 1
        }
      ]
    },
  ],
}
```

You can also have other query clauses in the scope such as `where`, `limit`,
etc.

```ts
customerRepo.find({
  include: [
    {
      relation: 'orders',
      scope: {
        where: {name: 'ToysRUs'},
        include: [{relation: 'manufacturers'}],
      },
    },
  ],
});
```

The `Where` clause above filters the result of `orders`.

{% include tip.html content="Make sure that you have all inclusion resolvers that you need REGISTERED, and
all relation names should be UNIQUE."%}
