---
lang: en
title: Error Codes
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Error Handling
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Error-codes.html
redirect_from: /doc/en/lb4/Error-handling.html
---

In order to allow clients to reliably detect individual error causes, LoopBack
sets the error `code` property to a machine-readable string.

## ENTITY_NOT_FOUND

The entity (model) was not found. This error is returned for example by
[`EntityCrudRepository.prototype.findById`](https://loopback.io/doc/en/lb4/apidocs.repository.entitycrudrepository.findbyid.html).

## VALIDATION_FAILED

The data provided by the client is not a valid entity.

## INVALID_PARAMETER_VALUE

The value provided for a parameter of a REST endpoint is not valid. For example,
a string value was provided for a numeric parameter.

## MISSING_REQUIRED_PARAMETER

No value was provided for a required parameter.

## CANNOT_INFER_PROPERTY_TYPE

LoopBack is using TypeScript design-time type metadata to automatically infer
simple property types like `string`, `number` or a model class.

In the following example, the type of the property `name` is inferred from
TypeScript metadata as `string`.

```ts
@model()
class Product {
  @property()
  name: string;
}
```

Design-time property type is not available in the following cases:

- The property has a type not supported by TypeScript metadata engine:
  - `undefined`
  - `null`
  - complex types like arrays (`string[]`), generic types (`Partial<MyModel>`),
    union types (`string | number`), and more.
- The TypeScript project has not enabled the compiler option
  `emitDecoratorMetadata`.
- The code is written in vanilla JavaScript.

<a id="cannot_infer_property_type-solutions"></a>

### Solutions

You have the following options how to fix the error
`CANNOT_INFER_PROPERTY_TYPE`:

1. If you are using TypeScript, make sure `emitDecoratorMetadata` is enabled in
   your compiler options.

   ```json
   {
     "$schema": "http://json.schemastore.org/tsconfig",
     "compilerOptions": {
       "emitDecoratorMetadata": true
     }
   }
   ```

   A typical LoopBack project is inheriting compiler options from
   `@loopback/build`, where `emitDecoratorMetadata` is already enabled.

   ```json
   {
     "$schema": "http://json.schemastore.org/tsconfig",
     "extends": "@loopback/build/config/tsconfig.common.json"
   }
   ```

2. If your property uses a complex type, then specify the type in the `type`
   field of `@property()` definition.

   ```ts
   @model()
   class UserProfile {
     @property({type: 'string'})
     hourFormat: '12h' | '24h';
   }
   ```

## Database Error Codes

When repository operations fail due to database constraints, connection issues,
or protocol errors, LoopBack maps low-level database driver errors to
standardized, protocol-neutral error codes.

These domain error codes are automatically mapped to corresponding REST HTTP
statuses by `@loopback/rest`:

| Error Code                    | HTTP Status              | Description                                                                                                                    |
| :---------------------------- | :----------------------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `UNIQUE_CONSTRAINT_VIOLATION` | 409 Conflict             | A record with a duplicate key or non-unique value was inserted or updated.                                                     |
| `LOCK_CONFLICT`               | 409 Conflict             | The operation failed due to a database deadlock or lock wait timeout.                                                          |
| `FOREIGN_KEY_VIOLATION`       | 422 Unprocessable Entity | The operation violates a foreign key constraint (referencing a non-existent parent or deleting a referenced parent).           |
| `NOT_NULL_VIOLATION`          | 400 Bad Request          | A required non-nullable database column was provided as `null` or omitted without a default value.                             |
| `CHECK_CONSTRAINT_VIOLATION`  | 400 Bad Request          | The operation violates a custom SQL `CHECK` constraint.                                                                        |
| `DATA_TYPE_MISMATCH`          | 400 Bad Request          | A value provided does not match the database column type (e.g., string length exceeded, invalid string format for field type). |
| `GENERATED_COLUMN_VIOLATION`  | 400 Bad Request          | An explicit attempt was made to write or update a generated/computed database column.                                          |
| `QUERY_TIMEOUT`               | 504 Gateway Timeout      | The database query execution exceeded the configured statement timeout threshold.                                              |
| `CONNECTION_FAILURE`          | 503 Service Unavailable  | The database connection was lost, refused, or unable to be acquired from the pool.                                             |

## Other error codes

Besides LoopBack-specific error codes, your application can encounter low-level
error codes from Node.js and the underlying operating system. For example, when
a connector is not able to reach the database, an error with code `ECONNREFUSED`
is returned.

See the following resources for a list of low-level error codes:

- [Common System Errors](https://nodejs.org/api/errors.html#errors_common_system_errors)
- [Node.js Error Codes](https://nodejs.org/api/errors.html#errors_node_js_error_codes)
