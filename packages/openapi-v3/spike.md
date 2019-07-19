## Improve the UX of @requestBody()

The original discussion is tracked in issue [Spike: simplify requestBody annotation with schema options](https://github.com/strongloop/loopback-next/issues/2654).

The current @requestBody() can only

- takes in an entire request body specification with very nested media type objects
or
- generate the schema inferred from the parameter type

To simplify the signature, this spike PR introduces a 2nd parameter `schemaOptions` to configure the schema. The new decorator `newRequestBody1` is written in file 'request-body.options1.decorator.ts'

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
  // Using advanced ts types like `Exclude<>`, `Partial<>` results in
  // `MetadataInspector.getDesignTypeForMethod(target, member)` only
  // returns `Object` as the param type, which loses the model type's info.
  // Therefore user must provide the model type in options.
  [TS_TYPE_KEY]: Product,
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
  [TS_TYPE_KEY]: Product,
  schemaName: 'PartialProduct',
  partial: true
}

class MyController2 {
  @put('/Product')
  update(@newRequestBody1(
    requestSpecForUpdate,
    partialOptions
  ) product: Partial<Product>) { }
}
```

