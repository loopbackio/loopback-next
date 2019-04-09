# Declarative definition of FOREIGN KEY and UNIQUE constraints

## Current status

Support for indexes and foreign keys depends on the connector. Some do support
all features, some support only some of them. Depending on the database used,
certain features are not possible to implement at all because of database design
constraints. For example, CouchDB/Cloudant do not support UNIQUE indexes

We have a syntax for defining (unique) indexes described in
[our docs](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#indexes),
this syntax supports composite indexes. However, many connectors are adding
their own extensions and PostgreSQL uses a slightly different format violating
our docs.

We have an undocumented syntax for defining foreign keys which is recognized by
all SQL connectors that provide migration of foreign keys. Unfortunately, this
syntax does not support composite foreign keys and there is also no support for
expressing `ON UPDATE` and `ON DELETE` behavior.

## Proposal

### Indexes at property level

Keep the current generic form as the baseline:

```js
{
  // property definitions:
  email: {
    type: 'string',
    index: {
      name: 'email_index',
      kind: 'UNIQUE' // Additional MySQL kinds: FULLTEXT, SPATIAL
      type: 'btree', // or hash
    }
  }
}
```

Support the following two short-hand forms:

- a "plain" index with no special configuration

  ```js
  // property definitions:
  {
    email: {
      type: 'string',
      index: true,
    }
  }
  ```

- UNIQUE index with no special configuration

  ```js
  // property definitions:
  {
    email: {
      type: 'string',
      unique: true,
    }
  }
  ```

We should also allow models to configure indexes for certain databases only,
using any of the three forms shown above.

```js
{
  email: {
    type: 'string',
    mysql: {
      index: true,
    }
  }
}
```

### Indexes at model level

Problem 1: different databases provide different indexing features.

- It seems that all databases support ASC/DESC option at column-level.
- MongoDB adds extra column-level option `text` as an alternative to ASC/DESC.
- PostgreSQL allows column expressions, e.g. `lower(email)`.

Problem 2: do we want to use database column names or LB property names? These
two names can be different, especially when using database-specific config to
map property names to custom column names.

The proposal:

**TBD**

### Foreign keys at property level

Introduce a new property metadata "references" (inspired by ANSI SQL):

```js
{
  categoryId: {
    type: 'number',
    references: {
      // a TypeResolver
      model: () => Category,
      // or a Model class
      model: Category
      // or a Model name
      model: 'Category'

      // name of the target property
      property: 'id',

      // referential actions
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
}
```

Support connector-specific configuration too.

```js
{
  categoryId: {
    type: 'number',
    mysql: {
      references: {
        model: () => Category,
        property: 'id',
      }
    }
}
```

### Foreign keys at model level

**TBD**

### Decorators

**TBD**

- index at property level
- index at model level
- foreign key at property level
- foreign key at model level

### Additional changes

When a model specifies an index or constraint that's not supported by the
connector running automigration, the connector should let the user know about
the problem. To preserve backwards compatibility, I am proposing to print a
console warning only.

We can also introduce a new `options` flag for `autoupdate`/`automigrate` to
control what happens when the model is specifying metadata that the connector
cannot process. The flag can allow three values:

- true: abort migration with error
- 'warn': print a warning and ignore unsupported metadata
- false: silently ignore unsupported metadata

## Next steps

- Describe the syntax in LB4 documentation
- Implement new decorators in `@loopback/repository`
- Spike: create a template implementation of index & constraint migration in
  `Connector` and `SqlConnector`, this will be a pre-requisite for later work in
  connectors.

## Detailed description of the current syntax

### Syntax for `index` creation, including `UNIQUE INDEX`

- Not supported by connectors: Oracle, DB2, DashDB,
- CouchDB and Cloudant support indexes, but not UNIQUE index - this is a
  limitation of the database design.

Docs: https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#indexes

#### Property level

- All supported connectors

  ```js
  {
    email: {
      type: 'string',
      // just an index
      index: true
    }

    email: {
      type: 'string',
      // UNIQUE constraint - not supported by CouchDB & Cloudant
      index: {
        unique: true
      }
    }
  ```

- MySQL, PostgreSQL, MSSQL:

  ```js
  email: {
    type: 'string',
    // custom kind & type
    index: {
      kind: 'UNIQUE' // Additional MySQL kinds: FULLTEXT, SPATIAL
      type: 'btree', // or hash

      name: 'index name', // supported by MSSQL only
    }
  }
  ```

- MongoDB:

  ```js
  {
    email: {
      type: 'string',

      // unique index
      index: true,
      unique: true,
    },

    email: {
      type: 'string',

      index: {
        unique: true,
        mongodb: {
          kind: 'text', // or 1, -1, etc.
        }
      }
    },
  ```

#### Model-settings level

- Common SQL flavor (supported by MySQL, PostgreSQL, MSSQL now):

```js
{
  indexes: {
    // a "plain" index
    index1: {
      // a CSV string of SQL-escaped column names,
      // possibly including additional modifiers
      columns: 'email, name';
    }

    // custom index
    index2: {
      columns: 'email, name';
      kind: 'UNIQUE',
      type: 'hash',
    }
  }
}
```

- MYSQL extras:

  ```js
  {
    indexes: {
      // unique index
      index1: {
        columns: 'email',
        options: {unique: true}
      }

      // also
      index2: {
        columns: 'email',
        kind: 'UNIQUE',
      }

      index3: {
        // key-value map using colum names (not property names!) as keys
        keys: {
          email: 1, // ASCENDING
          updatedAt: -1, // DESCENDING
        }
      }

      index4: {
        columns: 'email',
        type: 'btree' // CREATE INDEX ... USING btree
      }
    }
  }
  ```

  TODO: add support for index comments, e.g. via index.docs or index.comment

- PostgreSQL extras:

  ```js
  {
    indexes: {
      // just an index
      index0: {
        // list of SQL colum names, not LB property names!
        keys: ['email', 'createdByAdmin'];
      }
    }
  }
  ```

- MongoDB flavor:

  ```js
  {
    indexes: {
      index0: {
        name: 'optional name to overwrite index0'
        options: {unique: true},
        keys: {
          // keys are MongoDB column names, not LB property names!
          name: 1, // ascending
          updatedAt: -1, // descending
          subject: 'text', // text index
        }
      },

      index1: {
        // keys are specified directly in the index object
        email: 1,
        subject: 'text',
      }
    }
  }
  ```

- CouchDB, Cloudant flavor:

  ```js
  {
    index0: {
      keys: {
        name: 1, // ascending
        updatedAt: -1, // descending
      }
    }
  }
  ```

### Syntax for FOREIGN KEY constraints

Foreign keys are always defined at model-settings level.

- Supported by: MySQL, PostgreSQL
- Missing support in: MSSQL, Oracle
- Not possible to implement in: MongoDB, CouchDB, Cloudant

```js
{
  foreignKeys: {
    keyName: {
      name: 'constraint_name_for_db',
      entity: 'TargetModel',

      // MySQL: property name PostgreSQL: column name!
      foreignKey: 'source property or column name',
      // MySQL & PostgreSQL: column name!
      entityKey: 'target column name',
    }
  }
}
```

TODO: support `ON UPDATE` and `ON DELETE` options, e.g. `ON DELETE CASCADE`
