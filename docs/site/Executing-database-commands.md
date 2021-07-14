---
lang: en
title: 'Executing database commands'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Executing-database-commands.html
---

## Overview

{% include warning.html content="In general, it is always better to perform
database actions through `Repository` methods. Directly executing native database
commands may lead to unexpected results and other issues." %}

When you project outgrows built-in `Repository` methods, you can execute native
database commands to implement more complex data queries and manipulations, for
example execute a custom SQL query or invoke a MongoDB command.

LoopBack provides two APIs:

- DataSource-level `execute()` method
- Repository-level `execute()` method

Both methods offer the same set of signatures, the implementation in Repository
is just a thin wrapper delegating the task to DataSource.

Example use:

```ts
const result = await repository.execute('SELECT * FROM Products');
```

See API docs for parameter reference, additional information and examples:

- [SQL variant](./apidocs/repository.defaultcrudrepository.execute.md)
- [MongoDB variant](./apidocs/repository.defaultcrudrepository.execute_1.md)
- [Generic variant](./apidocs/repository.defaultcrudrepository.execute_2.md)

{% include important.html content="Each connector implements a slightly
different flavor of `execute()` to match the capabilities supported by the
database engine. Please refer to connector documentation to learn more about
the expected parameters and command/query syntax to use.
" %}

## Supported connectors

Not all connectors support execution of native database commands. Check your
connector's documentation to learn more. The following connectors are known to
support `execute` method.

<!-- Keep the entries sorted lexicographically (A-Z) -->

- [IBM DB2](./DB2-connector.md)
- [IBM DB2 for i](./DB2-for-i-connector.md)
- [IBM DB2 for z/OS](./DB2-for-z-OS-connector.md)
- [Oracle](./Oracle-connector.md)
- [Microsoft SQL](./SQL-Server-connector.md)
- [MongoDB](./MongoDB-connector.md)
- [MySQL](./MySQL-connector.md)
- [PostgreSQL](./PostgreSQL-connector.md)
- [SQLite3](./SQLite3.md)
