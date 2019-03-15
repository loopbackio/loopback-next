# Spike documentation

See the discussion in
[#2152](https://github.com/strongloop/loopback-next/issues/2152) for background
and information on different approaches I have researched and abandoned along
the way.

## Overview

In this feature branch, I am presenting a proof of concept implementation
demonstrating how to describe navigational properties for inclusion of related
models.

The solution consists of three parts:

1. A convention for describing navigational properties (links) via an interface,
   including support in `CrudRepository` and `DefaultCrudRepository` classes.

2. Improvements in repository-json-schema (`getJsonSchema` and
   `modelToJsonSchema`):

   - 2.1: A new option `includeRelations` controlling whether navigational
     properties are included in the generated schema.
   - 2.2: Support for cyclic references. For example: `CategoryWithLinks` has a
     property `products` containing an array of `ProductWithLinks`.
     `ProductWithLinks` has a property `category` containing
     `CategoryWithLinks`.
   - 2.3: A new helper function `modelToJsonSchemaRef` that emits JSON Schema
     reference and includes definitions of all references models.

3. Improvements in code generating controller OpenAPI spec allowing app
   developers to use `modelToJsonSchemaRef` to describe response schema.

Additionally, the todo-list example has been updated to show the proposed
solution in practice.

## Discussion

We have the following requirements on a solution for describing navigational
properties:

1. A (compile-time) type describing navigational properties of a model. For
   example, when a `Category` model has many instances of a `Product` model,
   then we want to define property `products` containing an array of `Product`
   instances _with product navigational properties included_.

2. Ability to define a compile-time type where all navigational properties are
   defined as optional. This is needed by Repository implementation.

3. Ability to generate two OpenAPI/JSON Schemas for each model:

   1. Own properties only
   2. Both own properties and navigational properties

4. SHOULD HAVE: To support JavaScript developers and declarative support, the
   new types should be optional. At runtime, we should leverage the dynamic
   nature of JavaScript objects and add navigational properties to an instance
   of the original mo/contrdel. Specifically, we should not require another
   model class to represent model with links.

My proposed solution meets all requirements above. Additionally, it consists of
several smaller building blocks that can be used beyond the scope of
navigational properties too.

## Solution details

### Interface describing model links

To describe navigation properties for TypeScript compiler, application
developers will define a new interface for each model.

BelongsTo relation:

```ts
@model()
class Product extends Entity {
  @belongsTo(() => Category)
  categoryId: number;
}

interface ProductLinks {
  category?: Category & CategoryLinks;
}
```

HasMany relation:

```ts
@model()
class Category extends Entity {
  @hasMany(() => Product)
  products?: Product[];
}

interface CategoryLinks {
  products?: Product & ProductLinks;
}
```

This solution has few important properties I'd like to explicitly point out:

- It is independent on how the relations are defined. `@belongsTo` decorator is
  applied on the foreign key property, `@hasMany` decorator is applied to a kind
  of a navigational property. If we decide to apply relational decorators at
  class level in the future, this solution will support that too.

- It does not trigger circular-reference bug in design:type metadata, see
  https://github.com/Microsoft/TypeScript/issues/27519

- It makes it easy to define a type where all navigational properties are
  optional. For example: `Product & Partial<ProductLinks>`

### Integration with CrudRepository APIs

The CRUD-related Repository interfaces and classes are accepting a new generic
argument `Links` that's describing navigational properties.

Example use in application-level repositories:

```ts
export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryLinks
> {
  // (no changes here)
}
```

### OpenAPI Schema generation

When building OpenAPI Schema from a model definition, we provide two modes:

- Own properties only
- Both own properties and navigational properties

The decision is controlled by a new option passed to `modelToJsonSchema` and
related methods.

```ts
// own properties only
const spec = getJsonSchema(Product);
// include navigational properties too
const spec = getJsonSchema(Product, {includeRelations: true});
```

An example of the produced schema:

```js
{
  title: 'CategoryWithLinks',
  properties: {
    // own properties
    id: {type: 'number'},
    // navigational properties
    products: {
      type: 'array',
      items: {$ref: '#/definitions/ProductWithLinks'},
    },
  },
  definitions: {
    ProductWithLinks: {
      title: 'ProductWithLinks',
      properties: {
        // own properties
        id: {type: 'number'},
        categoryId: {type: 'number'},
        // navigational properties
        category: {$ref: '#/definitions/CategoryWithLinks'},
      },
    },
  },
}
```

To support integration with OpenAPI spec of controllers, where we want to
reference a shared definition (component schema), we need a slightly different
schema. Here is an example as produced by `getJsonSchemaRef`:

```js
{
  $ref: '#/definitions/CategoryWithLinks',
  definitions: {
    CategoryWithLinks: {
      title: 'CategoryWithLinks',
      properties: {
        id: {type: 'number'},
        products: {
          type: 'array',
          items: {$ref: '#/definitions/ProductWithLinks'},
        },
      },
    }
    ProductWithLinks: {
      title: 'ProductWithLinks',
      properties: {
        id: {type: 'number'},
        categoryId: {type: 'number'},
        category: {$ref: '#/definitions/CategoryWithLinks'},
      },
    },
  },
}
```

### Controller spec

The last missing piece is integration with controller spec builder.

At the moment, we use the following implementation of the controller method
`find`:

```ts
class CategoryController {
  // constructor with @inject() decorators

  @get('/categories', {
    responses: {
      '200': {
        description: 'Array of Category model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {'x-ts-type': Category},
            },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Category)) filter?: Filter,
  ): Promise<TodoList[]> {
    return await this.categoryRepository.find(filter);
  }
}
```

In my proposal, we replace `x-ts-type` extension with a call to
`getModelSchemaRef`.

```diff
   schema: {
     type: 'array',
-    items: {'x-ts-type': Category},
+    items: getModelSchemaRef(Category, {includeRelations: true})
   },
```

I particularly like how this solution makes it easy to use a different mechanism
for generating model schema. Consider developers using TypeORM instead of our
Juggler-based Repository for an example. If we implement my proposal, then it
will be possible to implement a TypeORM extension for LoopBack that will provide
a different implementation of `getModelSchemaRef` function, one that will use
TypeORM metadata instead of juggler's LDL.

Later on, we can explore different ways how to enable `includeRelations` flag
via OpenAPI spec extensions. For example:

```diff
   schema: {
     type: 'array',
-    items: {'x-ts-type': Category},
+    items: {'x-ts-type': Category, 'x-include-relations': true},
   },
```

## Follow-up stories

1. Handle circular references when generating model JSON Schema

2. Support `schema: {$ref, definitions}` in resolveControllerSpec

3. Enhance `getJsonSchema` to describe navigational properties (introduce
   `includeRelations` option).

- Add a new `RelationDefinition` property: `targetsMany: boolean`
- Implement support for `includeRelations` in `getJsonSchema` & co.

4. Implement `getJsonSchemaRef` and `getModelSchemaRef` helpers

5. Modify Repository `find*` method signatures to include links (navigational
   properties) in the description of the return type

- Add a new generic parameter `Links` to CRUD-related Repository interfaces and
  implementations.
- Modify the signature `find` and `findById` to return `T & Partial<Links>`
  instead of `T`.

6. Update `examples/todo-list` to leverage these new features:

- Define `{Model}Links` interfaces
- Update `{Model}Repository` implementations to use these new interfaces
- Update repositories to include related models: overwrite `find` and `findById`
  methods, add a hard-coded retrieval of related models.
- Update response schemas for controller methods `find` and `findById`
