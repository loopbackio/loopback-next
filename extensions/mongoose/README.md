# @loopback/mongoose

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

## ⚠️Warnings⚠️

As of `0.0.1` of this extension, the type definitions of `@types/mongoose` are
several signifigant minor versions out of date: it supports mongoose `5.7.12`,
and the latest stable version of mongoose is `5.9.10`

## Using your existing Mongoose Schemas in Loopback

Using mongoose to devine your mongodb schemas is relatively straightforward,
though at this early stage it's still a number of steps:

- Import the component, and it's binding:
  `import {LoopbackMongooseComponent, MongooseBindings} from '@loopback/mongoose'`

- Register your configuration (see below)
  ```ts
  this.configure(MongooseBindings.COMPONENT).to(configuration);
  ```
- Add the component to your application
  ```ts
  this.component(LoopbackMongooseComponent);
  ```
- Finally, `@inject` your Entity Models for use
  ```ts
  public async MyService(@inject('loopback-mongoose-component.model.ModelName') ModelName) {
    const result = await ModelName.findOne({});
  }
  ```

## Configuration

There are three pieces of information that the Mongoose Component needs in order
to create a connection to your database and set up the mongoose models:

- the `uri` of the connection
- an array of Schemas
- optionally, an array of Discriminator Schemas

The configuration looks like the following:

```ts
 this.configure(MongooseBindings.COMPONENT).to({
   uri: 'mongodb://localhost:27017',
   connectionOptions: {} // anything valid to mongoose.createConnection(),
   schemas: [
     {
       bindingKey: 'my-custom.binding.key',
       schema: myImportedSchema,
       name: 'MyModel'
      }
   ],
   discriminators: [
     {
       bindingKey: 'my-custom.discriminator.binding.key',
       modelKey: 'my-custom.binding.key',
       schema: myImportedDiscriminatorSchema,
       value: 'MyModelDiscriminator'
     }
   ]
 })
```

For multiple connections, pass an array instead of an object:

```ts
this.configure(MongooseBindings.COMPONENT).to([
  {
    uri: 'mongodb://localhost:27017',
    schemas: [...]
  },
  {
    uri: 'mongodb://127.0.0.12:27017',
    schemas: [...]
  }
])
```

Remember, models are **always** scoped to a single connection. See the
[Mongoose Documentation for Multiple Connections](https://mongoosejs.com/docs/connections.html#multiple_connections)
for more information.

### uri

This is a valid mongodb connection uri string. See the
[MongoDB Documentation](https://docs.mongodb.com/manual/reference/connection-string/)
for more information.

### connectionOptions

_(optional)_

Optionally, these are options that can be passed to the mongoose
`createConnection` function. See the
[Mongoose Documentation](https://mongoosejs.com/docs/api.html#mongoose_Mongoose-createConnection)
for more details.

### Schemas

The Mongoose Component will create the schemas for you. Each item in this array
contains the information necessary to so do:

**schema** The schema class itself, created from `new mongoose.Schema({})`

**name** The model name passed to `connection.model(name, schema)`

**bindingKey** **optional** Optionally, you can create your own binding key. The
default binding key will be `loopback-mongoose-extensions.model.${name}`. If you
have multiple connections, the binding key will include the connection index:
`loopback-mongoose-extension.connection.0.model.${name}`

Using the same binding key for a model on multiple connections is not supported,
and doing so will throw an `InvalidArgumentException`.

## Discriminators

Creating discriminators requires having already created a model to create the
discriminator from. The configuration to do so requires the bindingKey for the
original model, as well as the binding key for the new model, as well as the
name of the discriminator.

**schema**

The schema class itself, created from `new mongoose.Schema({})`

**name**

The model name passed to `model.discriminator(name, schema)`

**modelKey**

This must be the same binding key used for the discriminator base model.

**bindingKey** _(optional)_

Optionally, you can create your own binding key. The default binding key will be
`loopback-mongoose-extensions.model.${name}`. If you have multiple connections,
the binding key will include the connection index:
`loopback-mongoose-extension.connection.0.model.${name}`

**value** **(optional)**

The string stored in the `discriminatorKey` property. See the
[mongoose documentation for discriminators](https://mongoosejs.com/docs/api.html#model_Model.discriminator).

# Using the Mongoose Extension

There is a full REST server used for
[integration tests](./src/__tests__/integration), which contains an example of
how to set up and use mongoose models and discriminators.
