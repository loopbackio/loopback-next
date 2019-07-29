## Improve the UX of @requestBody()

The original discussion is tracked in issue
[Spike: simplify requestBody annotation with schema options](https://github.com/strongloop/loopback-next/issues/2654).

The current @requestBody() can only

- takes in an entire request body specification with very nested media type
  objects or
- generate the schema inferred from the parameter type

To simplify the signature, this spike PR introduces two more parameters
`modelCtor` and `schemaOptions` to configure the schema. The new decorator
`requestBody2()`(let's discuss a better name later, see section
[Naming](#Naming) is written in file 'request-body.spike.decorator.ts'

### Signature

The new decorator's signature is
`@requestBody2(spec, modelCtor, schemaOptions)`.

```ts
export function requestBody2(
  specOrModelOrOptions?: Partial<RequestBodyObject> | Function | SchemaOptions,
  modelOrOptions?: Function | SchemaOptions,
  schemaOptions?: SchemaOptions,
) {
  // implementation
}
```

All the 3 parameters are optional, therefore in the PoC, the real implementation
are in `_requestBody2()`, `requestBody2()` is a wrapper that resolves different
combination of the parameters.

_Please note TypeScript doesn't support function overloading with different
number of parameters(like requestBody(spec), requestBody(model, options)).
Therefore we have to create a wrapper function to resolve different signatures
from the caller_

My PoC PR only adds 2 unit tests for different signatures, the real
implementation should test all the combinations.

### Create - exclude properties

Take "Create a new product with excluded properties" as an example:

```ts
// The decorator takes in the option without having a nested content object
class MyController1 {
  @post('/Product')
  create(
    @requestBody2(
      // Provide the description as before
      {
        description: 'Create a product',
        required: true,
      },
      // Using advanced ts types like `Exclude<>`, `Partial<>` results in
      // `MetadataInspector.getDesignTypeForMethod(target, member)` only
      // returns `Object` as the param type, which loses the model type's info.
      // Therefore user must provide the model type in options.
      Product,
      // Provide the options that configure your schema
      {
        // The excluded properties
        exclude: ['id'],
      },
    )
    product: Exclude<Product, ['id']>,
  ) {}
}
```

### Update - partial properties

```ts
class MyController2 {
  @put('/Product')
  update(
    @requestBody2(
      {description: 'Update a product', required: true},
      Product,
      {partial: true},
    )
    product: Partial<Product>,
  ) {}
}
```

## Naming

From @jannyHou: I think we can keep the name `requestBody` unchanged. I enabled
the existing `@requestBody()`'s tests but applied `requestBody2()` decorator,
all tests pass, which means there is no breaking change.

## Follow-up Stories

_I will create stories if we agree on the plan_

- [ ] Modify the current `@requestBody()` according to the spike code, pass
      existing tests across all repos.
- [ ] Add more unit tests to verify all the signatures.
- [ ] Upgrade examples to provide the descriptive configs(model, options) using
      the new decorator.
