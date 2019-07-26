## Improve the UX of @requestBody()

The original discussion is tracked in issue [Spike: simplify requestBody annotation with schema options](https://github.com/strongloop/loopback-next/issues/2654).

The current @requestBody() can only

- takes in an entire request body specification with very nested media type objects
or
- generate the schema inferred from the parameter type

To simplify the signature, this spike PR introduces two more parameters `modelCtor` and `schemaOptions` to configure the schema. The new decorator `requestBody2()`(let's discuss a better name later, see section [Naming](#Naming) is written in file 'request-body.spike.decorator.ts'

### Signature

The new decorator's signature  is `@requestBody2(spec, modelCtor, schemaOptions)`.

```ts
export function requestBody2(
  specOrModelOrOptions?: Partial<RequestBodyObject> | Function | SchemaOptions,
  modelOrOptions?: Function | SchemaOptions,
  schemaOptions?: SchemaOptions
) {
  // implementation
}
```

All the 3 parameters are optional, therefore in the PoC, the real implementation are in `_requestBody2()`, `requestBody2()` is a wrapper that resolves different combination of the parameters.

### Create - exclude properties

Take "Create a new product with excluded properties" as an example:

```ts
// Provide the description as before
const requestBodySpec = {
  description: 'Create a product',
  required: true,
};

// Provide the options that configure your schema
const excludeOptions = {
  // Make sure you give the custom schema a unique schema name,
  // this name will be used as the reference name
  // like `$ref: '#components/schemas/ProductWithoutID'`
  schemaName: 'ProductWithoutID',
  // The excluded properties
  exclude: ['id']
}

// The decorator takes in the option without having a nested content object
class MyController1 {
  @post('/Product')
  create(@newRequestBody1(
    requestBodySpec,
    // Using advanced ts types like `Exclude<>`, `Partial<>` results in
    // `MetadataInspector.getDesignTypeForMethod(target, member)` only
    // returns `Object` as the param type, which loses the model type's info.
    // Therefore user must provide the model type in options.
    Product
    excludeOptions
  ) product: Exclude<Product, ['id']>) { }
}
```

### Update - partial properties

```ts
const requestSpecForUpdate = {
  description: 'Update a product',
  required: true,
};

const partialOptions = {
  partial: true
}

class MyController2 {
  @put('/Product')
  update(@newRequestBody1(
    requestSpecForUpdate,
    Product
    partialOptions
  ) product: Partial<Product>) { }
}
```

## Naming

From @jannyHou: I think we can keep the name `requestBody` unchanged. I enabled the existing `@requestBody()`'s tests but applied `requestBody2()` decorator, all tests pass, which means there is no breaking change.
