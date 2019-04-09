# Declarative definition of FOREIGN KEY and UNIQUE constraints

## Current status

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
