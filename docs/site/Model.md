---
lang: en
title: 'Model'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI
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

- Entity: A domain object that has an identity (ID). Its equality is based on
  the identity. For example, `Customer` can be modeled as an `Entity` because
  each customer has a unique customer id. Two instances of `Customer` with the
  same customer id are equal since they refer to the same customer. For example,
  this is how a `Customer` can be modelled::

```ts
import {Entity, model, property} from '@loopback/repository';

@model()
export class Customer extends Entity {
  @property({id: true}) id: string;

  @property() name: string;

  @property() email: string;

  constructor(data?: Partial<Appointment>) {
    super(data);
  }
}
```

- Value Object: A domain object that does not have an identity (ID). Its
  equality is based on the structural value. For example, `Address` can be
  modeled as a `Value Object` because two US addresses are equal if they have
  the same street number, street name, city, and zip code values. For example,
  this is how a `Address` can be modelled::

```ts
import {Model, model, property} from '@loopback/repository';

@model()
export class Address extends Model {
  @property() streetNum: number;

  @property() streetName: string;

  @property() city: string;

  @property() zipCode: string;

  constructor(data?: Partial<Address>) {
    super(data);
  }
```

Currently, we provide the `@loopback/repository` module, which provides special
decorators `@model` and `@property` for adding metadata to your
TypeScript/JavaScript classes. Please read on to learn more.

## Definition of a Model

A typical LoopBack 4 model is written in TypeScript. We use decorators `@model`
and `@property` to annotate or modify the class and class members respectively.

```ts
import {Entity, model, property} from '@loopback/repository';

@model({setting: {hiddenProperties: 'id'}})
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: false,
  })
  des?: string;

  constructor(data?: Partial<Appointment>) {
    super(data);
  }
}
```

We also provide a useful command line interface (CLI)
[`lb4 model`](Model-generator.md) to generate models.

At its core, a model in LoopBack is a simple JavaScript class. With the
extensibility of `@model` and `@property` decorators, we are able to manipulate
the metadata or even integrate with JSON Schema generation.

For example, the following is a simple model `Customer`:

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

The `@model` decorator can take `jsonSchema` to customize the JSON schema
inferred for the model class. For example,

```ts
@model({
  jsonSchema: {
    title: 'Customer',
    required: ['email'],
  },
})
export class Customer {
  // ...
}
```

### Defining a Model at Runtime

Models can also be created at runtime using the `defineModelClass()` helper
function from the `@loopback/repository` class. It expects a base model to
extend (typically `Model` or `Entity`), followed by a `ModelDefinition` object
as shown in the example below.

```ts
const bookDef = new ModelDefinition('Book')
  .addProperty('id', {type: 'number', id: true})
  .addProperty('title', {type: 'string'});
const BookModel = defineModelClass<typeof Entity, {id: number; title?: string}>(
  Entity, // Base model
  bookDef, // ModelDefinition
);
```

You will notice that we are specifying generic parameters for the
`defineModelClass()` function. The first parameter is the base model, the second
one is an interface providing the TypeScript description for the properties of
the model we are defining. If the interface is not specified, the generated
class will have only members inherited from the base model class, which
typically means no properties.

In case you need to use an existing Model as the base class, specify the Model
as the base class instead of `Entity`.

```ts
// Assuming User is a pre-existing Model class in the app
import {User} from './user.model';
import DynamicModelCtor from '@loopback/repository';
const StudentModel = defineModelClass<
  typeof User,
  // id being provided by the base class User
  {university?: string}
>(User, studentDef);
```

If you want make this new Model available from other parts of the app, you can
call `app.model(StudentModel)` to create a binding for it.

{% include note.html content="
The `app.model()` method is available only on application classes with
`RepositoryMixin` applied.
" %}

### Model Discovery

Instead of creating models from scratch, LoopBack can automatically generate
model definitions by discovering the schema of your database. See
[Discovering models](Discovering-models.md) for more details and a list of
connectors supporting model discovery.

## Model Metadata

As we mentioned before, LB4 uses `@model` and `@property` to collect metadata
from a model class. To enable such decorators from module
`@loopback/repository`, you will need to extend your classes from `Entity` and
decorate them with the `@model` and `@property` decorators:

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

Except for definitions, there are a bunch of settings you can apply through
`@model` and/or `@property`. For example, by default, LB4 classes forbid
additional properties that are not specified in the type definition. Such
constraints can be disabled through `@model` when it comes to **NoSQL**
databases such as MongoDB, as they support free-form properties. Please check
out the following [Model decorator](#model-decorator) and
[Property decorator](#property-decorator) sections for details.

## Model Decorator

The model decorator can be used without any additional parameters, or can be
passed in a ModelDefinitionSyntax:

<!-- according to https://github.com/strongloop/loopback-datasource-juggler/blob/master/lib/model-builder.js#L283 and the legacy juggler file-->

```ts
@model({
  name: 'Category',
  settings: {
    // etc...
  },
  // define properties by @property decorator below
})
class Category extends Entity {
  // etc...
  @property({type: 'number'})
  categoryId: number;
}
```

`name` can be omitted as the model decorator already knows the name of your
model class:

```ts
@model()
class Product extends Entity {
  name: string;
  // other properties...
}
```

{% include note.html content="If you used LoopBack 3 before, the model decorator in LoopBack 4 is not exactly the same as what it is
in LB3. For example, properties and relations cannot be defined through the model decorator. Please check the following section for available entries." %}

<!-- Please modify this part when options is available -->

As for entries in `settings`, LoopBack 4 supports these built-in entries for
now:

### Supported Entries of Model Definition

<!-- These entries might need to update once we've made some changes:
  - description [in lb3 we support array or string, but here we documented it as string only]
  these two don't seem work in lb4. Moved them to unsupported table.
-->

  <table>
  <thead>
  <tr>
    <th width="160">Property</th>
    <th width="100">Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  </thead>

  <tbody>
  <tr>
    <td><code>name</code></td>
    <td>String</td>
    <td>None</td>
    <td>Name of the model.</td>
  </tr>
  <tr>
  <td><code>settings.description</code></td>
  <td>String</td>
  <td>None</td>
  <td>
    Optional description of the model. We only support string type for now. (see <a href="https://github.com/strongloop/loopback-next/issues/3428">issue #3428</a> for more discussion.)
  </td></tr>

  <tr>
    <td><code>settings.forceId</code></td>
    <td>Boolean</td>
    <td><code>true</code></td>
    <td>
      Set it to <code>true</code> to prevent clients from setting the auto-generated ID value manually.
    </td>
  </tr>

  <tr>
    <td><code>settings.hiddenProperties</code></td>
    <td>Array of String</td>
    <td><code>None</code></td>
    <td>
      The properties can be hidden from response bodies
      (<code>.toJSON()</code> output). See <a href="#hidden-properties">Hidden properties</a> section below for details.
  </td>
  </tr>

  <tr>
    <td><code>settings.scope</code></td>
    <td>Object</td>
    <td>N/A</td>
    <td>Scope enables you to set a scope that will apply to every query made by the model's repository. See <a href="#scope">Scope</a> below for more details and examples.</td>
  </tr>

  <tr>
    <td><code>settings.strict</code></td>
    <td>Boolean or String</td>
    <td><code>true</code></td>
    <td>
      In LB4, the default for this entry is set to be <code>true</code>.<br/>
      Specifies whether the model accepts only predefined properties or not. One of:
      <ul>
      <li><code>true</code>: Only properties defined in the model are accepted. It ensure the model accepts only predefined properties.
      If a model instance contains properties that are not predefined, LoopBack throws a <code>ValidationError</code>. In addition, SQL databases only support this mode.
      </li>
      <li><code>false</code>: The model is an open model and accepts all properties, including ones not predefined in the model.
        This mode is useful to store free-form JSON data to a schema-less database such as MongoDB and supported by such databases only.
      </li>
      <li><code>"filter"</code>: Only properties defined in the model are accepted.
      If you load or save a model instance with properties that are not predefined, LoopBack will ignore them. This is particularly useful when dealing with old data that you wish to lose without a migration script.
      </li>
      </ul>
    </td>
  </tr>

  </tbody>

  </table>

To discover more about `Model Decorator` in LoopBack 4, please check
[legacy-juggler-bridge file](https://github.com/strongloop/loopback-next/blob/2fa5df67181cdcd23a5dce90c9c640fe75943cb8/packages/repository/src/repositories/legacy-juggler-bridge.ts)
and
[model-builder file](https://github.com/strongloop/loopback-datasource-juggler/blob/master/lib/model-builder.js).

### Unsupported Entries

If you're a LB3 user, the following entries that are no longer available in LB4:

<details><summary markdown="span"><strong>Click to Expand</strong></summary>
<!-- Please update the OPTIONS, ACLS field when they are available -->
<table>
  <thead>
    <tr>
      <th width="160">Property</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td><code>acls</code></td>
    <td>
      (TBD)
    </td>
  </tr>
  <tr>
  <td><code>base</code></td>
  <td>This entry is no longer being used. This is done by the typical Js/Tsc classes inheritance way in LB4:
  <pre><code>@model() class MySuperModel extends MyBaseModel {...}</code>
  </pre></td>
  </tr>
  <tr>
  <td><code>excludeBaseProperties</code></td>
  <td>(TBD)</td>
  </tr>
  <tr>
  <td><code>http</code></td>
  <td> This entry affects HTTP configuration in LB3. Since in LB4 http configurations are inferred from controller members and the rest server, this field is not applicable.</td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td>
      (TBD) see <a href="https://github.com/strongloop/loopback-next/issues/2142">issue #2142</a> for further discussion.
    </td>
  </tr>
  <tr>
    <td><code>plural</code></td>
    <td>This entry is part of HTTP configuration in LB3. So it's not applicable for the same reason as <code>http</code> above.</td>
  </tr>

  <tr>
    <td><code>properties</code></td>
    <td>This entry is no longer being used as we introduced <code>@property</code> decorator in LB4. See <code>@property</code> decorator below to discover moer about how to define properties for your models.</td>
  </tr>
  <tr>
    <td><code>relations</code></td>
    <td>
      With the introduction of <a href="https://loopback.io/doc/en/lb4/Repositories.html">repositories</a>, now <code>relations</code> are defined by <code>relations decorators</code> in LB4.
      See <a href="https://loopback.io/doc/en/lb4/Relations.html">Relations</a> for more details.
    </td>
  </tr>
  <tr>
    <td><code>remoting.<br/>normalizeHttpPath</code></td>
    <td>
    This entry is part of HTTP configuration in LB3. So it's not applicable for the same reason as <code>http</code> above.
    </td>
  </tr>
  <tr>
    <td><code>replaceOnPUT</code></td>
    <td>This entry is no longer supported as LB4 controllers scaffolded by LB4 controller, PUT is always calling replaceById. Users are free to change the generated code to call <code>patchById</code> if needed.</td>
  </tr>
  </tbody>
</table>

</details>

### Hidden Properties

The properties are stored in the database, available in JS/TS code, can be set
via POST/PUT/PATCH requests, but they are removed from response bodies
(`.toJSON()` output).

To hide a property, you can use the `hiddenProperties` setting like this:

```ts
@model({
  settings: {
    hiddenProperties: ['password']
  }
})
class MyUserModel extends Entity {
  @property({id: true})
  id: number;
   @property({type: 'string'})
  email: string;
   @property({type: 'string'})
  password: string;
  ...
}
```

### Scope

_Scope_ enables you to set a scope that will apply to every query made by the
model's repository.

If you wish for a scope to be applied across all queries to the model, set the
scope to do so. For example:

```ts
@model({
  settings: {
    scope: {
      limit: 2,
      where: {deleted: false}
    },
  }
})
export class Product extends Entity {
  ...
```

Now, any CRUD operation with a query parameter runs in the default scope will be
applied; for example, assuming the above scope, a find operation such as

```ts
await ProductRepository.find({offset: 0});
```

Becomes the equivalent of this:

```ts
await ProductRepository.find({
  offset: 0,
  limit: 2,
  where: {deleted: false},
});
```

## Property Decorator

<!-- Property decorator can reuse lb3 docs -->

LoopBack 4 uses the property decorator for property definitions.

```ts
@model()
class Product extends Entity {
  @property({
    name: 'name',
    description: "The product's common name.",
    type: 'string',
  })
  public name: string;

  @property({
    type: 'number',
    id: true,
  })
  id: number;
}
```

Here are general attributes for property definitions:

<table>
  <thead>
    <tr>
      <th width="100">Key</th>
      <th>Required?</th>
      <th>Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>default</code></td>
      <td>No</td>
      <td>Any*</td>
      <td>
        Default value for the property. The type must match that specified by <code>type</code>. <strong>NOTE</strong>: if you have both <code>default</code> value set and <code>required</code> set to <code>true</code>, you will still need to include the property in the request body of POST/PUT requests as LoopBack follows the OpenAPI standard that <code>required</code> means the user needs to provide the field in the request always.
      </td>
    </tr>
    <tr>
      <td><code>defaultFn</code></td>
      <td>No</td>
      <td>String</td>
      <td>
        A name of the function to call to set the default value for the property. Must be one of:
        <ul>
          <li>
            <code>"guid"</code>: generate a new globally unique identifier (GUID) using the computer MAC address and current time (UUID version 1).
          </li>
          <li><code>"uuid"</code>: generate a new universally unique identifier (UUID) using the computer MAC address and current time (UUID version 1).</li>
          <li><code>"uuidv4"</code>: generate a new universally unique identifier using the UUID version 4 algorithm.</li>
          <li>"<code>now"</code>: use the current date and time as returned by <code>new Date()</code></li>
        </ul>
        NOTE: the value of <code>defaultFn</code> is generated by LoopBack itself. If you'd like to use database built-in <code>uuid</code> functions (MySQL or Postgres for example), please check the README file of the corresponding connector.
      </td>
    </tr>
    <tr>
      <td><code>description</code></td>
      <td>No</td>
      <td>String or Array</td>
      <td>
        Documentation for the property.
        You can split long descriptions into arrays of strings (lines) to keep line lengths manageable. For example:
        <pre>[
"LoopBack 4 is a highly extensible Node.js and TypeScript framework",
"for building APIs and microservices.",
"Follow us on GitHub: https://github.com/strongloop/loopback-next."
]</pre>
      </td>
    </tr>
    <tr>
      <td><code>doc</code></td>
      <td>No</td>
      <td>String</td>
      <td>Documentation for the property. <strong>Deprecated, use "description" instead.</strong></td>
    </tr>
    <tr>
      <td><code>id</code></td>
      <td>No</td>
      <td>Boolean</td>
      <td>
        Whether the property is a unique identifier. Default is <code>false</code>.
        See <a href="#id-properties">ID properties</a> section below for detailed explanations.
      </td>
    </tr>
    <tr>
      <td><code>index</code></td>
      <td>No</td>
      <td>Boolean</td>
      <td>Whether the property represents a column (field) that is a database index.</td>
    </tr>
    <tr>
      <td><code>required</code></td>
      <td>No</td>
      <td>Boolean</td>
      <td>
        Whether a value for the property is required in the request body for creating or updating a model instance.<br/><br/>
        Default is <code>false</code>. <strong>NOTE</strong>: As LoopBack follows the OpenAPI standard, <code>required</code> means the user needs to provide the field in the request always. POST/PUT requests might get rejected if the request body doesn't include the required property even it has <code>default</code> value set.
      </td>
    </tr>
    <tr>
      <td><code>type</code></td>
      <td>Yes</td>
      <td>String</td>
      <td>
        Property type. Can be any type described in <a href="LoopBack-types.html">LoopBack types</a>.
      </td>
    </tr>
  </tbody>
</table>

### ID Properties

LoopBack 4 expects a model to have one _ID property_ that uniquely identifies
the model instance.

{% include important.html content="LB4 doesn't support composite keys for now, e.g joining two tables with more than one source key. Related GitHub issue: [Composite primary/foreign keys](https://github.com/strongloop/loopback-next/issues/1830)" %}

To explicitly specify a property as ID, set the `id` property of the option
to `true`. The `id` property value must be one of:

- `true`: the property is an ID.
- `false` (or any value that converts to false): the property is not an ID
  (default).

In database terms, the ID property is primary key column. Such properties are
defined with the 'id' attribute set to true.

For example,

```ts
  @property({
    type: 'number',
    id: true,
  })
  id: number;
```

In LoopBack, [auto-migration](Database-migrations.md) helps the user create
relational database schemas based on definitions of their models. Here are some
id property settings that can be used for auto-migration / auto-update:

<table>
  <thead>
    <tr>
      <th width="100">Key</th>
      <th>Required?</th>
      <th width="100">Type</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>generated</code></td>
      <td>No</td>
      <td>Boolean</td>
      <td><strong>For auto-migrate usage</strong>. The <code>generated</code> property indicates the ID will be automatically generated by the database. When it is set to <code>true</code>, the value of the id property will be generated by the database automatically with its default type (e.g integer for MySQL and string for MongoDB).</td>
    </tr>
    <tr>
      <td><code>useDefaultIdType</code></td>
      <td>No</td>
      <td>Boolean</td>
      <td><strong>For auto-migrate usage</strong>. Set it to <code>false</code> when it's needed to auto-generate non-default type property values. For example, for PostgreSQL, to use uuid as the id property, the id type should set to string, <code>generated</code> should set to <code>true</code>, and this field should be set to <code>false</code>. Please check each connector's README file for more information about auto-migration/auto-update.</td>
    </tr>
  </tbody>
</table>

Tips:

1.  LoopBack CRUD methods expect the model to have an "id" property if the model
    is backed by a database.
2.  A model without any "id" properties can only be used without attaching to a
    database.
3.  If an ID property has `generated` set to `true`, the connector decides what
    type to use for the auto-generated key. For example for SQL Server, it
    defaults to `number`. This can be overwritten by setting `useDefaultIdType`
    to `false`.
4.  Check out [Database Migration](Database-migrations.md) if you'd like to have
    LoopBack 4 create relational database's schemas for you based on model
    definitions. Always check [Database Connectors](Database-connectors.md) for
    details and examples for database migration / discover.

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

Extra attributes for json schema can be supplied via the `jsonSchema` within the
second parameter.

```ts
@model()
class Customer extends Entity {
  @property(String, {
    jsonSchema: {
      format: 'email',
    },
  })
  email: string;
}
```

For `@property.array`, the `jsonSchema` is for the item type instead of the
array itself.

```ts
@model()
class TestModel {
  @property.array(String, {
    jsonSchema: {
      format: 'email',
      minLength: 5,
      maxLength: 50,
      transform: ['toLowerCase'],
    },
  })
  emails?: string[];
}
```

To define a nested array property, you must provide the `jsonSchema` field to
describe the sub-array property. For example:

```ts
@model()
class TestModel {
  // alternatively use @property.array('array')
  @property.array(Array, {
    jsonSchema: {
      type: 'array',
      items: {type: 'string'},
    },
  })
  nestedArr: Array<Array<string>>;
}
```

If the `jsonSchema` field is missing, you will get an error saying

> You must provide the "jsonSchema" field when define a nested array property'

### Custom Validation Rules and Error Messages

You can also specify the validation rules in the `jsonSchema` field of the
property option and configure them with custom error messages.

The validation rules and custom error messages are configured this way.

```ts
@model()
class Product extends Entity {
  @property({
    name: 'name',
    description: "The product's common name.",
    type: 'string',
    // JSON validation rules
    jsonSchema: {
      minLength: 10,
      maxLength: 30,
      errorMessage: 'Name should be between 10 and 30 characters.',
    },
  })
  public name: string;
}
```

In case you want to send an error message specific to the validation rule that
did not pass, you can configure `errorMessage` this way.

```ts
jsonSchema: {
  minLength: 10,
  maxLength: 30,
  errorMessage: {
    // Corresponding error messages
    minLength: 'Name should be at least 10 characters.',
    maxLength: 'Name should not exceed 30 characters.',
  }
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

{% include note.html content=" Currently, property types must be specified
explicitly either on the property itself or via the `type` option of the
property decorator. Aliased types or types that extracted from a class or
interface (e.g. `public name: OtherClass['otherProperty']`) will not work
properly and will result in the property type being resolved as an empty object
rather than the intended type in the generated OpenAPI specifcation. This is due
to a limitation and flaw in the way TypeScript currently generates the metadata
that is used to generate the OpenAPI specification for the application." %}

Example:

```ts
export class StandardUser {
  public email: string;
  public anotherProperty: boolean;
}

@model()
export class UserModel {
  @property()
  public email: StandardUser['email']; // => results in \"__metadata(\"design:type\", Object)\" instead of \"__metadata(\"design:type\", String)\"
}
```

(see [Issue #3863](https://github.com/strongloop/loopback-next/issues/3863) for
more details)

```ts
@model()
class Product extends Entity {
  @property()
  public name: string; // The type information for this property is String.
}
```

### ENUM Property

{% include note.html content="
Currently, the `enum` type is not supported; this is tracked in [GitHub issue #3033](https://github.com/strongloop/loopback-next/issues/3033). Below, we present a workaround for to allow you to use this type.
" %}

The `@property` decorator can take in `jsonSchema` to customize the JSON schema
inferred for the model property. For `enum` type, it can be used as follows:

```ts
enum QueryLanguage {
  JSON = 'json',
  SQL = 'sql',
  MONGO = 'mongo'
}

// ...

@property({
  type: 'string',
  required: true,
  jsonSchema: {
    enum: Object.values(QueryLanguage),
  },
})
queryLanguage: QueryLanguage;
```

## How LoopBack Models Map to Database Tables/collections

A frequently asked question is, how can I configure a custom table/collection
name different from model class name?

No matter you set up models and database tables/collections through the CLI
[`lb4 model`](Model-generator.md), [Model migration](Database-migrations.md), or
[Model discovery](Discovering-models.md), models/properties would be mapped to
corresponding tables/columns based on some conventions or connector-specific
setting in model and/or property definitions.

When there is no any connector-specific settings, for example:

```ts
@model()
export class MyModel extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
  })
  id: number;

  @property({
    type: 'string',
    required: false,
  })
  myName?: string;
}
```

connectors would map the model based on the convention they have. Take the
Oracle connector as an example, it would look for a table named `MYMODEL` under
the default schema in the database and also map properties `id` and `name` to
columns named `ID` and `MYNAME` in that table as UPPERCASE is the default case
of Oracle database. Similarly, with the PostgreSQL connector, it would look for
a table named `mymodel` under the default schema and columns named `id` and
`myname`. On one hand, it's convenient if you have default values on your
database. On the another hand, it might be troublesome if it fails to find
tables/columns with default names.

The following shows the general idea of how you can specify database definition
through the connector-specific settings to avoid the issue above.

{% include important.html content="Please do check out specific database connectors as the setup might be vary, e.g don't have the concept of `schema`. Also notice that not all connectors support customized config such as Cloudant." %}

### Data Mapping Properties

The following fields of `settings` of the **model definition** can
describe/customize schemas or tables/collections names in the database as
`settings.<connectorName>`:

<table>
  <thead>
    <tr>
      <th width="260">Property</th>
      <th width="100">Type</th>
      <th width="540">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>[connectorName].schema</code></td>
      <td>String</td>
      <td>schema of the table.</td>
    </tr>
    <tr>
      <td><code>[connectorName].table</code></td>
      <td>String</td>
      <td>the table name. For SQL databases.</td>
    </tr>
    <tr>
      <td><code>[connectorName].collection</code></td>
      <td>String</td>
      <td>the table name. For NoSQL databases.</td>
    </tr>
  </tbody>
</table>

The following fields of `settings` of the **model definition**
describe/customize schemas or tables/collections names in the database as
`settings.<connectorName>.<propName>`:

The following are common fields of the **property definition** that describe the
columns in the database as `<connectorName>.<propName>:

<table>
  <thead>
    <tr>
      <th width="260">Property</th>
      <th width="100">Type</th>
      <th width="540">Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>columnName</code></td>
      <td>String</td>
      <td>Column name. For SQL databases.</td>
    </tr>
    <tr>
      <td><code>fieldName</code></td>
      <td>String</td>
      <td>Column name. For NoSQL databases.</td>
    </tr>
    <tr>
      <td><code>dataType</code></td>
      <td>String</td>
      <td>Data type as defined in the database</td>
    </tr>
    <tr>
      <td><code>dataLength</code></td>
      <td>Number</td>
      <td>Data length</td>
    </tr>
    <tr>
      <td><code>dataPrecision</code></td>
      <td>Number</td>
      <td>Numeric data precision</td>
    </tr>
    <tr>
      <td><code>dataScale</code></td>
      <td>Number</td>
      <td>Numeric data scale</td>
    </tr>
    <tr>
      <td><code>nullable</code></td>
      <td>Boolean</td>
      <td>If <code>true</code>, data can be null</td>
    </tr>
  </tbody>
</table>

The following example shows how to configure custom table/column names different
from the model and some other settings in PostgreSQL database:

```ts
@model({
  settings: {
    postgresql: {schema: 'quarter2', table: 'my_model'}, // custom names
  },
})
export class MyModel extends Entity {
  @property({
    type: 'number',
    required: true,
    id: true,
    postgresql: {
      columnName: 'custom_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'my_name',
      dataType: 'text',
      dataLength: 20,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  myName?: string;
}
```

With the mapping, you can configure custom names different from the model. In
the above example, the model property (`id`) maps to the database column named
(`custom_id`) in the table named `my_model`.

<div class="sl-hidden"><strong>Non-public Information</strong><br>
  Removed until <a href="https://github.com/strongloop/loopback-datasource-juggler/issues/128" class="external-link" rel="nofollow">https://github.com/strongloop/loopback-datasource-juggler/issues/128</a> is resolved.
  <p>Conversion and formatting properties</p>
  <p>Format conversions are declared in properties, as described in the following table:</p>
      <table>
        <tbody>
          <tr>
            <th>Key</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
          <tr>
            <td>trim</td>
            <td>Boolean</td>
            <td>Whether to trim the string</td>
          </tr>
          <tr>
            <td>lowercase</td>
            <td>Boolean</td>
            <td>Whether to convert a string to lowercase</td>
          </tr>
          <tr>
            <td>uppercase</td>
            <td>Boolean</td>
            <td>Whether to convert a string to uppercase</td>
          </tr>
          <tr>
            <td>format</td>
            <td>Regular expression</td>
            <td>Format for a date property.</td>
          </tr>
        </tbody>
      </table>
</div>

## JSON Schema Inference

Use the `@loopback/repository-json-schema` module to build a JSON schema from a
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

### Supported JSON Keywords

{% include note.html content="
This feature is still a work in progress and is incomplete.
" %}

Following are the supported keywords that can be explicitly passed into the
decorators to better tailor towards the JSON Schema being produced:

| Keywords    | Decorator   | Type    | Default      | Description                                             |
| ----------- | ----------- | ------- | ------------ | ------------------------------------------------------- |
| title       | `@model`    | string  | _model name_ | Name of the model                                       |
| description | `@model`    | string  | None         | Description of the model                                |
| array       | `@property` | boolean | None         | Used to specify whether the property is an array or not |
| required    | `@property` | boolean | `false`      | Used to specify whether the property is required or not |

## Other ORMs

You might decide to use an alternative ORM/ODM in your LoopBack application.
LoopBack 4 no longer expects you to provide your data in its own custom Model
format for routing purposes, which means you are free to alter your classes to
suit these ORMs/ODMs.

However, this also means that the provided schema decorators will serve no
purpose for these ORMs/ODMs. Some of these frameworks may also provide
decorators with conflicting names (e.g. another `@model` decorator), which might
warrant avoiding the provided juggler decorators.
