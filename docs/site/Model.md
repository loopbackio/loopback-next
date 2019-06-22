---
lang: en
title: 'Model'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Model.html
---

## Overview

A model describes business domain objects, for example, `Customer`, `Address`,
and `Order`. It usually defines a list of properties with name, type, and other
constraints.

{% include note.html content="Models describe the shape of data. Behavior like CRUD operations is added by repositories. This is different from LoopBack 3.x where models implement behavior too." %}

{% include tip.html content="A single model can be used with multiple different Repositories." %}

Models can be used for data exchange on the wire or between different systems.
For example, a JSON object conforming to the `Customer` model definition can be
passed in REST/HTTP payload to create a new customer or stored in a document
database such as MongoDB. Model definitions can also be mapped to other forms,
such as relational database schemas, XML schemas, JSON schemas, OpenAPI schemas,
or gRPC message definitions, and vice versa.

There are two subtly different types of models for domain objects:

- Value Object: A domain object that does not have an identity (ID). Its
  equality is based on the structural value. For example, `Address` can be
  modeled as a `Value Object` because two US addresses are equal if they have
  the same street number, street name, city, and zip code values. For example:

```json
{
  "name": "Address",
  "properties": {
    "streetNum": "string",
    "streetName": "string",
    "city": "string",
    "zipCode": "string"
  }
}
```

- Entity: A domain object that has an identity (ID). Its equality is based on
  the identity. For example, `Customer` can be modeled as an `Entity` because
  each customer has a unique customer id. Two instances of `Customer` with the
  same customer id are equal since they refer to the same customer. For example:

```json
{
  "name": "Customer",
  "properties": {
    "id": "string",
    "lastName": "string",
    "firstName": "string",
    "email": "string",
    "address": "Address"
  }
}
```

Currently, we provide the `@loopback/repository` module, which provides special
decorators for adding metadata to your TypeScript/JavaScript classes in order to
use them with the legacy implementation of the
[datasource juggler](https://github.com/strongloop/loopback-datasource-juggler).

## Definition of a Model

At its core, a model in LoopBack is a simple JavaScript class.

```ts
export class Customer {
  email: string;
  isMember: boolean;
  cart: ShoppingCart;
}
```

Extensibility is a core feature of LoopBack. There are external packages that
add additional features, for example, integration with the juggler bridge or
JSON Schema generation. These features become available to a LoopBack model
through the `@model` and `@property` decorators from the `@loopback/repository`
module.

```ts
import {model, property} from '@loopback/repository';

@model()
export class Customer {
  @property()
  email: string;
  @property()
  isMember: boolean;
  @property()
  cart: ShoppingCart;
}
```

## Model Discovery

LoopBack can automatically create model definitions by discovering the schema of
your database. See [Discovering models](Discovering-models.md) for more details
and a list of connectors supporting model discovery.

## Using the Juggler Bridge

To define a model for use with the juggler bridge, extend your classes from
`Entity` and decorate them with the `@model` and `@property` decorators.

```ts
import {model, property, Entity} from '@loopback/repository';

@model()
export class Product extends Entity {
  @property({
    id: true,
    description: 'The unique identifier for a product',
  })
  id: number;

  @property()
  name: string;

  @property()
  slug: string;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
```

Models are defined primarily by their TypeScript class. By default, classes
forbid additional properties that are not specified in the type definition. The
persistence layer respects this constraint and configures underlying
PersistedModel classes to enforce `strict` mode.

To create a model that allows both well-defined but also arbitrary extra
properties, you need to disable `strict` mode in model settings through the CLI
and tell TypeScript to allow arbitrary additional properties to be set on model
instances.

```ts
@model({settings: {strict: false}})
class MyFlexibleModel extends Entity {
  @property({id: true})
  id: number;

  // Define well-known properties here

  // Add an indexer property to allow additional data
  [prop: string]: any;
}
```

### Model Decorator

The model decorator can be used without any additional parameters, or can be
passed in a

<!-- should be replaced with a lb4 example when possible -->

[ModelDefinitionSyntax](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html)
object which follows the general format provided in LoopBack 3:

```ts
@model({
  name: 'Category',
  properties: {
    // define properties here.
  },
  settings: {
    // etc...
  },
})
class Category extends Entity {
  // etc...
}
```

However, the model decorator already knows the name of your model class, so you
can omit it.

```ts
@model()
class Product extends Entity {
  name: string;
  // other properties...
}
```

Additionally, the model decorator is able to build the properties object through
the information passed in or inferred by the property decorators, so the
properties key value pair can also be omitted.

### Property Decorator

The property decorator takes in the same arguments used in LoopBack 3 for
individual property entries:

```ts
@model()
class Product extends Entity {
  @property({
    name: 'name',
    description: "The product's common name.",
    type: 'string',
  })
  public name: string;
}
```

The complete list of valid attributes for property definitions can be found in
LoopBack 3's
[Model definition section](https://loopback.io/doc/en/lb3/Model-definition-JSON-file.html#properties).

You can also specify the validation rules in the field `jsonSchema`. For
example:

```ts
@model()
class Product extends Entity {
  @property({
    name: 'name',
    description: "The product's common name.",
    type: 'string',
    // Specify the JSON validation rules here
    jsonSchema: {
      maxLength: 30,
      minLength: 10,
    },
  })
  public name: string;
}
```

Check out the documentation of
[Parsing requests](Parsing-requests.md#request-body) to see how to do it in
details.

<!-- NOTE(kjdelisle): Until we have a metadata docs section, link to the
package in the repository. -->

The property decorator leverages LoopBack's
[metadata package](https://github.com/strongloop/loopback-next/tree/master/packages/metadata)
to determine the type of a particular property.

```ts
@model()
class Product extends Entity {
  @property()
  public name: string; // The type information for this property is String.
}
```

### Array Property Decorator

There is a limitation to the metadata that can be automatically inferred by
LoopBack, due to the nature of arrays in JavaScript. In JavaScript, arrays do
not possess any information about the types of their members. By traversing an
array, you can inspect the members of an array to determine if they are of a
primitive type (string, number, array, boolean), object or function, but this
does not tell you anything about what the value would be if it were an object or
function.

For consistency, we require the use of the `@property.array` decorator, which
adds the appropriate metadata for type inference of your array properties.

```ts
@model()
class Order extends Entity {
  @property.array(Product)
  items: Product[];
}

@model()
class Thread extends Entity {
  // Note that we still require it, even for primitive types!
  @property.array(String)
  posts: string[];
}
```

Additionally, the `@property.array` decorator can still take an optional second
parameter to define or override metadata in the same fashion as the `@property`
decorator.

```ts
@model()
class Customer extends Entity {
  @property.array(String, {
    name: 'names',
    required: true,
  })
  aliases: string[];
}
```

### JSON Schema inference

Use the `@loopback/repository-json-schema module` to build a JSON schema from a
decorated model. Type information is inferred from the `@model` and `@property`
decorators. The `@loopback/repository-json-schema` module contains the
`getJsonSchema` function to access the metadata stored by the decorators to
build a matching JSON schema of your model.

```ts
import {model, property} from '@loopback/repository';
import {getJsonSchema} from '@loopback/repository-json-schema';

@model()
class Category {
  @property()
  name: string;
}

@model()
class Product {
  @property({required: true})
  name: string;
  @property()
  type: Category;
}

const jsonSchema = getJsonSchema(Product);
```

`jsonSchema` from above would return:

```json
{
  "title": "Product",
  "properties": {
    "name": {
      "type": "string"
    },
    "type": {
      "$ref": "#/definitions/Category"
    }
  },
  "definitions": {
    "Category": {
      "properties": {
        "name": {
          "type": "string"
        }
      }
    }
  },
  "required": ["name"]
}
```

If a custom type is specified for a decorated property in a model definition,
then a reference
[`$ref`](http://json-schema.org/latest/json-schema-core.html#rfc.section.8)
field is created for it and a `definitions` sub-schema is created at the
top-level of the schema. The `definitions` sub-schema is populated with the type
definition by recursively calling `getJsonSchema` to build its properties. This
allows for complex and nested custom type definition building. The example above
illustrates this point by having the custom type `Category` as a property of our
`Product` model definition.

#### Supported JSON keywords

{% include note.html content="
This feature is still a work in progress and is incomplete.
" %}

Following are the supported keywords that can be explicitly passed into the
decorators to better tailor towards the JSON Schema being produced:

| Keywords    | Decorator   | Type    | Default      | Description                                             |
| ----------- | ----------- | ------- | ------------ | ------------------------------------------------------- |
| title       | `@model`    | string  | _model name_ | Name of the model                                       |
| description | `@model`    | string  |              | Description of the model                                |
| array       | `@property` | boolean |              | Used to specify whether the property is an array or not |
| required    | `@property` | boolean |              | Used to specify whether the property is required or not |

## Other ORMs

You might decide to use an alternative ORM/ODM in your LoopBack application.
LoopBack 4 no longer expects you to provide your data in its own custom Model
format for routing purposes, which means you are free to alter your classes to
suit these ORMs/ODMs.

However, this also means that the provided schema decorators will serve no
purpose for these ORMs/ODMs. Some of these frameworks may also provide
decorators with conflicting names (e.g. another `@model` decorator), which might
warrant avoiding the provided juggler decorators.
