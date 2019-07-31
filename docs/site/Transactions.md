---
title: 'Using database transactions'
lang: en
layout: page
keywords: LoopBack 4.0, LoopBack 4, Transactions, Transaction
tags:
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Using-database-transactions.html
summary: Transactional API usage in LoopBack 4
---

## Overview

A *transaction* is a sequence of data operations performed as a single logical
unit of work. Many relational databases support transactions to help enforce
data consistency and business logic requirements.

A repository can perform operations in a transaction when the backing datasource
is attached to one of the following connectors:

- [MySQL connector](MySQL-connector.html) (IMPORTANT: Only with InnoDB as the
  storage engine).
- [PostgreSQL connector](PostgreSQL-connector.html)
- [SQL Server connector](SQL-Server-connector.html)
- [Oracle connector](Oracle-connector.html)
- [DB2 Connector](DB2-connector.html)
- [DashDB Connector](DashDB.html)
- [DB2 iSeries Connector](DB2-iSeries-connector.html)
- [DB2 for z/OS connector](DB2-for-z-OS.html)
- [Informix connector](Informix.html)

The repository class needs to extend from `TransactionalRepository` repository
interface which exposes the `beginTransaction()` method. Note that LoopBack only
supports database local transactions - only operations against the same
transaction-capable datasource can be grouped into a transaction.

## Transaction APIs

The `@loopback/repository` package includes `TransactionalRepository` interface
based on `EntityCrudRepository` interface. The `TransactionalRepository`
interface adds a `beginTransaction()` API that, for connectors that allow it,
will start a new Transaction. The `beginTransaction()` function gives access to
the lower-level transaction API, leaving it up to the user to create and manage
transaction objects, commit them on success or roll them back at the end of all
intended operations. See [Handling Transactions](#handling-transactions) below
for more details.

## Handling Transactions

See
the [API reference](https://apidocs.strongloop.com/loopback-datasource-juggler/#datasource-prototype-begintransaction) for
full transaction lower-level API documentation.

Performing operations in a transaction typically involves the following steps:

- Start a new transaction.
- Perform create, read, update, and delete operations in the transaction.
- Commit or rollback the transaction.

### Start transaction

Use the `beginTransaction()` method to start a new transaction from a repository
class using `DefaultTransactionalRepository` as a base class.

Here is an example:

```ts
import {
  Transaction,
  DefaultTransactionalRepository,
  IsolationLevel,
} from '@loopback/repository';
// assuming there is a Note model extending Entity class, and
// ds datasource which is backed by a transaction enabled
// connector
const repo = new DefaultTransactionalRepository(Note, ds);
// Now we have a transaction (tx)
const tx = await repo.beginTransaction(IsolationLevel.READ_COMMITTED);
```

You can also extend `DefaultTransactionalRepository` for custom classes:

```ts
import {inject} from '@loopback/core';
import {
  juggler,
  Transaction,
  DefaultTransactionalRepository,
  IsolationLevel,
} from '@loopback/repository';
import {Note, NoteRelations} from '../models';

export class NoteRepository extends DefaultTransactionalRepository<
  Note,
  typeof Note.prototype.id,
  NoteRelations
> {
  constructor(@inject('datasources.ds') ds: juggler.DataSource) {
    super(Note, ds);
  }
}
```

#### Isolation levels

When you call `beginTransaction()`, you can optionally specify a transaction
isolation level. LoopBack transactions support the following isolation levels:

- `Transaction.READ_UNCOMMITTED`
- `Transaction.READ_COMMITTED` (default)
- `Transaction.REPEATABLE_READ`
- `Transaction.SERIALIZABLE`

If you don't specify an isolation level, the transaction uses READ_COMMITTED .

{% include important.html content="

**Oracle only supports READ_COMMITTED and SERIALIZABLE.**

" %}

For more information about database-specific isolation levels, see:

- [MySQL SET TRANSACTION Syntax](https://dev.mysql.com/doc/refman/5.7/en/set-transaction.html)
- [Oracle Isolation Levels](http://docs.oracle.com/cd/B14117_01/server.101/b10743/consist.htm#i17856)
- [PostgreSQL Transaction Isolation](http://www.postgresql.org/docs/9.4/static/transaction-iso.html)
- [SQL Server SET TRANSACTION ISOLATION LEVEL](https://msdn.microsoft.com/en-us/library/ms173763.aspx)

### Perform operations in a transaction

To perform create, retrieve, update, and delete operations in the transaction,
add the transaction object to the `Options` parameter of the standard 
[`create()`](https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.create.html),
[`update()`](https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.update.html),
[`deleteAll()`](https://loopback.io/doc/en/lb4/apidocs.repository.defaultcrudrepository.deleteall.html)
(and so on) methods.

For example, again assuming a `Note` model, `repo` transactional repository, and
transaction object `tx` created as demonstrated in
[Start transaction](#start-transaction) section:

```ts
const created = await repo.create({title: 'Groceries'}, {transaction: tx});
const updated = await repo.update(
  {title: 'Errands', id: created.id},
  {transaction: tx},
);

// commit the transaction to persist the changes
await tx.commit();
```

Propagating a transaction is explicit by passing the transaction object via the
options argument for all create, retrieve, update, and delete and relation
methods.

### Commit or rollback

Transactions allow you either to commit the transaction and persist the CRUD
behaviour onto the database or rollback the changes. The two methods available
on transaction objects are as follows:

```ts
  /**
   * Commit the transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback the transaction
   */
  rollback(): Promise<void>;
```

## Set up timeout

You can specify a timeout (in milliseconds) to begin a transaction. If a
transaction is not finished (committed or rolled back) before the timeout, it
will be automatically rolled back upon timeout by default.

For example, again assuming a `Note` model and `repo` transactional repository,
the `timeout` can be specified as part of the `Options` object passed into the
`beginTransaction` method.

```ts
const tx: Transaction = await repo.beginTransaction({
  isolationLevel: IsolationLevel.READ_COMMITTED,
  timeout: 30000, // 30000ms = 30s
});
```

## Avoid long waits or deadlocks

Please be aware that a transaction with certain isolation level will lock
database objects. Performing multiple methods within a transaction
asynchronously has the great potential to block other transactions (explicit or
implicit). To avoid long waits or even deadlocks, you should:

1.  Keep the transaction as short-lived as possible
2.  Don't serialize execution of methods across multiple transactions
