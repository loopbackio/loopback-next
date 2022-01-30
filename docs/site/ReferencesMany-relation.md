---
lang: en
title: 'referencesMany Relation'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Model Relation
sidebar: lb4_sidebar
permalink: /doc/en/lb4/ReferencesMany-relation.html
---

## Overview

{% include important.html content="Please read [Relations](Relations.md) first." %}

LoopBack relations enable you to create connections between models and provide
navigation APIs to deal with a graph of model instances. In addition to the
traditional ones, LoopBack supports `referencesMany` relation that embeds an
array of foreign keys to reference other objects. For example:

```json
{
  "id": 1,
  "name": "John Smith",
  "accountIds": ["saving-01", "checking-01"]
}
```

To add a `referencesMany` relation to your LoopBack application, you need to
perform the following steps:

1. Add a property to your source model to define the array of foreign keys.
2. Modify the source model repository class to provide an accessor function for
   obtaining the target model instances.
3. Call the accessor function in your controller methods.

## Defining a referencesMany relation

This section describes how to define a `referencesMany` relation at the model
level using the `@referencesMany` decorator to define the array of foreign keys.

LB4 also provides an CLI tool `lb4 relation` to generate `referencesMany`
relation for you. Before you check out the
[`Relation Generator`](https://loopback.io/doc/en/lb4/Relation-generator.html)
page, read on to learn how you can define relations to meet your requirements.

### Relation Metadata

LB4 uses three `keyFrom`, `keyTo` and `name` fields in the `referencesMany`
relation metadata to configure relations. The relation metadata has its own
default values for these three fields:

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
      <td>the array property of foreign keys</td>
      <td>the target model name appended with `Ids` in camel case</td>
      <td><code>Customer.accountIds</code></td>
    </tr>
    <tr>
      <td><code>keyTo</code></td>
      <td>the source key of the target model</td>
      <td>the primary key in the target model</td>
      <td><code>Account.id</code></td>
    </tr>
    <tr>
      <td><code>name</code></td>
      <td>the name of the relation</td>
      <td>the plural name of target model</td>
      <td><code>accounts</code></td>
    </tr>

  </tbody>
</table>

We recommend to use default values. If you'd like to customize the name of
foreign keys or the relation name, you'll need to specify some fields through
the relation decorator.

The standard naming convention for the property of foreign keys in the source
model is `target name` + `Ids` (for example, Customer.accountIds).

{% include code-caption.html content="/src/models/customer.model.ts" %}

```ts
import {referencesMany, Entity, model, property} from '@loopback/repository';
import {Account} from './account.model';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @referencesMany(() => Account)
  accountIds: number[]; // relation name will default to `accounts`

  constructor(data: Partial<Customer>) {
    super(data);
  }
}

export interface CustomerRelations {
  // describe navigational properties here
}

export type CustomerWithRelations = Customer & CustomerRelations;
```

If the property name of foreign keys in the source model has to be customized
(`account_ids` instead of `accountIds` for example), the relation name has to be
explicitly specified in the `name` attribute of the relation definition.
Otherwise the _default relation name_ generates by LB4 (`account_ids` in this
case) will be the same as the customized name of foreign keys, which is invalid.

{% include warning.html content="Make sure that you have different names for the property name of foreign keys and the relation name in ReferencesMany relations."%}

```ts
// import statements
@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id: number;

  @property({
    type: 'string',
  })
  name: string;

  @referencesMany(
    () => Account,
    {name: 'accounts'}, // specify the relation name if fk is customized
  )
  account_ids: number[]; // customized foreign keys

  // other properties, constructor, etc.
}
```

If you need to use _different names for models and database columns_, to use
`account_ids` as db column name other than `accountIds` for example, passing the
column name in the third argument to the `referencesMany` decorator would allow
you to do so:

```ts
class Customer extends Entity {
  // constructor, properties, etc.
  @referencesMany(() => Account, {keyFrom: 'accountIds'}, {name: 'account_ids'})
  accountIds: number[];
}
```

If you need to use another attribute other than the id property to be the source
key of the target model (joining two tables on non-primary attribute), the
`keyTo` attribute in the relation definition has to be stated explicitly.

```ts
class Customer extends Entity {
  // constructor, properties, etc.
  @referencesMany(() => Account, {keyTo: 'customized_target_property'})
  accountIds: number[];
}

export interface CustomerRelations {
  accounts?: AccountWithRelations[];
}
```

{% include important.html content="LB4 doesn't support composite keys for now. e.g joining two tables with more than one source key. Related GitHub issue: [Composite primary/foreign keys](https://github.com/loopbackio/loopback-next/issues/1830)" %}

## Configuring a referencesMany relation

The configuration and resolution of a `referencesMany` relation takes place at
the repository level. Once `referencesMany` relation is defined on the source
model, then there are a couple of steps involved to configure it and use it. On
the source repository, the following are required:

- In the constructor of your source repository class, use
  [Dependency Injection](Dependency-injection.md) to receive a getter function
  for obtaining an instance of the target repository.
- Declare a property with the factory function type
  `ReferencesManyAccessor<targetModel, typeof sourceModel.prototype.id>` on the
  source repository class.
- call the `createReferencesManyAccessorFor` function in the constructor of the
  source repository class with the relation name (decorated relation property on
  the source model) and target repository instance and assign it the property
  mentioned above.

The following code snippet shows how it would look like:

{% include code-caption.html
content="/src/repositories/customer.repository.ts" %}

```ts
import {Getter, inject} from '@loopback/core';
import {
  ReferencesManyAccessor,
  DefaultCrudRepository,
  juggler,
  repository,
} from '@loopback/repository';
import {Account, Customer, CustomerRelations} from '../models';
import {AccountRepository} from '../repositories';

export class CustomerRepository extends DefaultCrudRepository<
  Customer,
  typeof Customer.prototype.id,
  CustomerRelations
> {
  public readonly accounts: ReferencesManyAccessor<
    Account,
    typeof Customer.prototype.id
  >;

  constructor(
    @inject('datasources.db') protected db: juggler.DataSource,
    @repository.getter('AccountRepository')
    accountRepositoryGetter: Getter<AccountRepository>,
  ) {
    super(Customer, db);
    this.accounts = this.createReferencesManyAccessorFor(
      'accounts',
      accountRepositoryGetter,
    );
  }
}
```

`ReferencesManyAccessor` is a function accepting the primary key (id) of a
source model instance (e.g. `customer.id`) and returning back the related target
model instances (e.g. a `Account[]`). See also
[API Docs](https://loopback.io/doc/en/lb4/apidocs.repository.belongstoaccessor.html)

{% include note.html content="Notice that `CustomerRepository.create()` expects an `Customer` model only, navigational properties are not expected to be included in the target data. For instance, the following request will be rejected:
`customerRepository.create({`
`  id: 1,`
`  name: 'John'`
`  accountIds: [1]`
`  accounts:[{id: 1, balance: 0}] // rejected`
`})`" %}

## Querying related models

Different from LB3, LB4 creates a different inclusion resolver for each relation
type to query related models. Each **relation** has its own inclusion resolver
`inclusionResolver`. And each **repository** has a built-in property
`inclusionResolvers` as a registry for its inclusionResolvers.

A `referencesMany` relation has an `inclusionResolver` function as a property.
It fetches target models for the given list of source model instances.

### Use the relation between `Customer` and `Account` we show above.

After setting up the relation in the repository class, the inclusion resolver
allows users to retrieve all customers along with their related accounts through
the following code at the repository level:

```ts
customerRepo.find({include: ['accounts']});
```

or use APIs with controllers:

```
GET http://localhost:3000/customers?filter[include][]=accounts
```

### Enable/disable the inclusion resolvers

- Base repository classes have a public property `inclusionResolvers`, which
  maintains a map containing inclusion resolvers for each relation.
- The `inclusionResolver` of a certain relation is built when the source
  repository class calls the `createReferencesManyAccessorFor` function in the
  constructor with the relation name.
- Call `registerInclusionResolver` to add the resolver of that relation to the
  `inclusionResolvers` map. (As we realized in LB3, not all relations are
  allowed to be traversed. Users can decide to which resolvers can be added.)
  The first parameter is the name of the relation.

The following code snippet shows how to register the inclusion resolver for the
referencesMany relation 'accounts':

```ts
export class CustomerRepository extends DefaultCrudRepository {
  accounts: ReferencesManyAccessor<Account, typeof Customer.prototype.id>;

  constructor(
    dataSource: juggler.DataSource,
    accountRepositoryGetter: Getter<AccountRepository>,
  ) {
    super(Customer, dataSource);

    // we already have this line to create a ReferencesManyRepository factory
    this.accounts = this.createReferencesManyAccessorFor(
      'accounts',
      accountRepositoryGetter,
    );

    // add this line to register inclusion resolver.
    this.registerInclusionResolver('accounts', this.accounts.inclusionResolver);
  }
}
```

- We can simply include the relation in queries via `find()`, `findOne()`, and
  `findById()` methods. For example, these queries return all customers with
  their accounts:

  if you process data at the repository level:

  ```ts
  customerRepository.find({include: ['accounts']});
  ```

  this is the same as the url:

  ```
  GET http://localhost:3000/customers?filter[include][]=accounts
  ```

  which returns:

  ```ts
  [
    {
      id: 1,
      name: 'John',
      accountIds: [12, 16],
      accounts: [
        {
          id: 12,
          balance: 99,
        },
        {
          id: 16,
          balance: 0,
        },
      ],
    },
    {
      id: 2,
      name: 'Dave',
      accountIds: [4],
      accounts: [
        {
          id: 4,
          balance: 10,
        },
      ],
    },
  ];
  ```

- You can delete a relation from `inclusionResolvers` to disable the inclusion
  for a certain relation. e.g
  `customerRepository.inclusionResolvers.delete('accounts')`

### Query multiple relations

It is possible to query several relations or nested include relations with
custom scope once you have the inclusion resolver of each relation set up. Check
[HasMany - Query multiple relations](HasMany-relation.md#query-multiple-relations)
for the usage and examples.
