## Improve the UX of @requestBody()

The original discussion is tracked in issue
[Spike: simplify requestBody annotation with schema options](https://github.com/strongloop/loopback-next/issues/2654).

The current @requestBody() can only

- takes in an entire request body specification with very nested media type
  objects OR
- generates the schema inferred from the parameter type

It doesn't give people the convenience to configure the schema spec with `model`
and `schemaOptions` without defining them in a nested object. To simplify the
signature, this spike PR introduces two more parameters `model` and
`schemaOptions` to configure the schema.

Please note the 2nd and 3rd parameters are only used to contribute the spec for
_default schema_(I will explain what default means with an example), any other
request body spec are still defined in the 1st parameter.

See the example from the swagger official website:
https://swagger.io/docs/specification/describing-request-body/

- `application/json` and `application/xml` share the same schema
  `#/components/schemas/Pet`
- `application/x-www-form-urlencoded` uses another schema
  `#/components/schemas/PetForm'
- `text/plain` receives a string: `type: string`

The new decorator allows

- a default schema (generated from the 2nd and 3rd params, should be `Pet` in
  this case) _and_
- custom schemas (provided by the 1st parameter: partial spec, `PetForm` and
  string schema)

so that developers don't need to repeat defining the same schema in the 1st
parameter.

The logic of the new decorator is:

- The 1st parameter contains the pure OpenAPI request body spec
- Other parameters contribute the default schema' config, `model`, `options`.
- The decorator:
  - first reads schema config
  - then generate default schema spec accordingly
  - if any content type is missing `schema`, then assign the default schema to
    it(Our current implementation is already doing it, see
    [code](https://github.com/strongloop/loopback-next/blob/master/packages/openapi-v3/src/decorators/request-body.decorator.ts#L103-L107))

ANY OTHER PARTS of the spec are read from the 1st parameter, the decorator only
generate and merge the default `schema`. We can implement helpers/builders for
developers to build the entire spec, like

```ts
requestBodyBuilder
  .addContent('application/x-www-form-urlencoded')
  .withSchema(model, options)
  .withExample(exampleSpecs);
```

The new decorator `requestBody2()`(let's discuss a better name later, see
section [Naming](#Naming) is written in file 'request-body.spike.decorator.ts'

### Signature

The new decorator's signature is
`@requestBody2(spec, modelCtor, schemaOptions)`.

All the 3 parameters are optional, therefore in the PoC, the real implementation
are in `_requestBody2()`, `requestBody2()` is a wrapper that resolves different
combination of the parameters.

My PoC PR only adds 2 unit tests for different signatures, the real
implementation should test all the combinations.

```ts
export function _requestBody2<T>(
  specOrModelOrOptions?: Partial<RequestBodyObject>,
  modelOrOptions?: Function & {prototype: T},
  schemaOptions?: SchemaOptions,
) {
  // implementation
}
```

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
    @requestBody2({description: 'Update a product', required: true}, Product, {
      partial: true,
    })
    product: Partial<Product>,
  ) {}
}
```

## Naming

From @jannyHou: I think we can keep the name `requestBody` unchanged. I enabled
the existing `@requestBody()`'s tests but applied `requestBody2()` decorator,
all tests pass, which means there is no breaking change.

## Follow-up Stories

- [ ] More discussion

  - The signature:
    - `@requstBody(spec, model, options)`
    - or `@requestBody(specWithOptions, model)`
    - or `@requestBody(spec, getModelSchemaRef(model, options))`
    - or any better signatures
  - Which signatures should be disabled

- [ ] Implementation
  - Modify the current `@requestBody()` according to the spike code, pass
    existing tests across all repos.
  - Add more unit tests to verify all the signatures.
  - Fix the type conflict detect, see test case 'catches type conflict', and
    discussion in
    [comment](https://github.com/strongloop/loopback-next/pull/3466/files#r308657211)
- [ ] Upgrade examples to provide the descriptive configs(model, options) using
      the new decorator.
