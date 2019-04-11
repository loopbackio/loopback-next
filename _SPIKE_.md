# Declarative definition of FOREIGN KEY and UNIQUE constraints

- [Current status](#current-status)
- [Proposal](#proposal)
  - [Indexes at property level](#indexes-at-property-level)
  - [Indexes at model level](#indexes-at-model-level)
  - [Foreign keys at property level](#foreign-keys-at-property-level)
  - [Foreign keys at model level](#foreign-keys-at-model-level)
  - [Decorators](#decorators)
  - [Additional changes](#additional-changes)
- [Next steps](#next-steps)
- [Detailed description of the current syntax](#detailed-description-of-the-current-syntax)

## Current status

UNIQUE index is supported as a specialized version of a generic index feature.

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

You can find more details in
[Detailed description of the current syntax](#detailed-description-of-the-current-syntax)
at the bottom.

## Proposal

### Indexes at property level

Support the following two short-hand forms only. Ask users to use model-level
form to define indexes that are more complex.

- a "plain" index with no special configuration

  ```js
  {
    email: {
      type: 'string',
      index: true,
    }
  }
  ```

- UNIQUE index with no special configuration

  ```js
  {
    email: {
      type: 'string',
      unique: true,
    }
  }
  ```

We should also allow models to configure indexes for certain databases only by
using database-specific options we already use to control column name, storage
data type, etc.

```js
{
  email: {
    type: 'string',
    mysql: {
      index: true,
      // unique: true
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

**The proposal:**

At high-level, keep the current syntax where indexes are defined via a key-value
map stored in `settings.indexes` property, the key is the index name and the
value is an index definition object.

```js
{
  strict: false,
  forceID: true,
  indexes: {
    uniqueEmail: {
      // index definition
    },
    nameQueries: {
      // index definition
    }
  }
}
```

Individual indexes can be defined as follows:

- Add a new field `properties` as a key-value map from property names to
  indexing order:

  ```js
  // definition of an individual index
  {
    properties: {
      email: 1, // ASC
      createdAt: 'DESC', // alias for -1
      bio: 'text', // database-specific value (MongoDB's "text")
    }
  }
  ```

  Important: property names are mapped to database column names when building
  the index definition.

- Keep supporting `keys` field as a key-value map from database column name to
  indexing order, see the description of the actual status below. Entries from
  `keys` should me merged with entries from `properties`, `keys` taking
  precedence (replacing `properties` entries).

- Keep supporting `unique` field (set it to `true` to let the index enforce
  uniqueness).

- Database-specific options will be stored under a key with the connector name:

  ```js
  {
    properties: {
      email: 'ASC',
    },
    mongodb: {
      sparse: true,
    },
    mysql: {
      kind: 'fulltext',
      type: 'hash',
    },
    postgresql: {
      type: 'hash',
    }
  }
  ```

- To support more complex indexes offered by e.g. PostgreSQL, we should support
  `columns` field too. This field should contain an array of column-index
  specification, for example:

  ```js
  ['email ASC', 'lower(name) DESC'];
  ```

  In the contrary with the current implementation, I am proposing that `columns`
  should replace any column list created from `properties` and `keys`, and that
  `columns` should be nested inside connector-specific options:

  ```js
  {
    properties: {
      // default setup used by most connectors
      email: 'ASC',
    },
    postgresql: {
      // in PostgreSQL, use a different index definition
      columns: ['lower(email) ASC']
    },
  }
  ```

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

Modify the current connector-dependant syntax to make it easier to read and
support composite foreign keys too.

```js
{
  foreignKeys: {
    [keyName]: {
      // optional, overrides keyName
      name: 'constraint_name_for_db',

      // Property name(s) (will be mapped to column name)
      // formerly: foreignKey
      sourceProperties: ['source property name'],


      // formerly: entity
      targetModel: 'TargetModel',

      // Property name(s) (will be mapped to column name)
      // formerly: entityKey
      targetProperties: ['target property name'],

      // referential actions
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
  }
}
```

### Decorators

I am proposing to reuse existing `@property` and `@model` decorators. They are
accepting full Model/Property definition interfaces, no additional changes are
needed to make them support the new index/FK syntax.

### Additional changes

When a model specifies an index or constraint that's not supported by the
connector running automigration, the connector should let the user know about
the problem. To preserve backwards compatibility, I am proposing to print a
console warning only.

We can also introduce a new `options` flag for `autoupdate`/`automigrate` to
control what happens when a model definition specifies metadata that the
connector cannot process. The flag can allow three values:

- true: abort migration with error
- 'warn': print a warning and ignore unsupported metadata
- false: silently ignore unsupported metadata

## Next steps

1. Describe the new syntax in definition interfaces in
   [`model.ts`](https://github.com/strongloop/loopback-next/blob/master/packages/repository/src/model.ts),
   include comprehensive API documentation.

   Modify `DefaultCrudRepository` constructor to process model-level indexes and
   foreign keys; it needs to fill the corresponding fields in juggler model
   settings.

   Update `examples/todo-list` to define FK and UNIQUE constraints

   Update CLI templates for relations to define the constraints too. If the pull
   request [#2426](https://github.com/strongloop/loopback-next/pull/2426) is not
   landed yet then create a follow-up story instead.

2. Add a new documentation page `How-tos >> Configure indexes and foreign keys`,
   provide a high-level overview of indexes, foreign keys and how to define them
   for LB4 models.

   Explain that we don't have full support for this feature yet, link to GitHub
   issues tracking the work.

   Show how to configure indexes and foreign keys at model level via legacy
   juggler settings, link to LB3 docs:
   https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#indexes. Offer
   this approach as a workaround until we implement full support. (See also
   https://github.com/strongloop/loopback-next/issues/2723)

3. Implement a helper functions in base `Connector` class to process index and
   foreign-key definitions in an unified way and convert them into data suitable
   for consumption by connector implementation. The helpers should apply
   database-specific options, merges keys/properties fields in index
   definitions, etc. and produce definition that can be directly mapped to
   database commands. This will become a prerequisite for implementation of
   indexes & foreign keys in other connectors, most notably `memory` connector
   ([#2333](https://github.com/strongloop/loopback-next/issues/2333)) and
   `SqlConnector` (see below).

4. Spike: a template implementation of index & constraint migration in
   `SqlConnector`. The intention is to share as much of index/FK migration logic
   among all SQL connectors. This spike will allow us to better understand the
   effort needed to implement migration in our SQL connectors
   ([#2332](https://github.com/strongloop/loopback-next/issues/2332))

   Use the existing implementation in MySQL, PostgreSQL and MSSQL connectors for
   inspiration.

   Detect index/FK metadata not supported by SQL and report warnings to console.

5. Modify the description of the story to implement index/FK in `memory`
   connector, require the connector to warn about index/PK fields not supported.

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
- Not supported: `ON UPDATE` and `ON DELETE` options, e.g. `ON DELETE CASCADE`
- Not supported: composite foreign keys

```js
{
  foreignKeys: {
    [keyName]: {
      // optional, overrides keyName
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
