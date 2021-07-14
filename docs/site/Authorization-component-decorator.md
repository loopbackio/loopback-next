---
lang: en
title: 'Authorization Component - Decorator'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authorization-component-decorator.html
---

Users can annotate the controller methods with access specifications using an
`authorize` decorator. The access specifications are defined as per type
[AuthorizationMetadata](https://github.com/strongloop/loopback-next/blob/master/packages/authorization/src/types.ts)
which consists of the following:

- type of the protected resource (such as customer or order)
- allowed roles and denied roles (to provide ACL based rules)
- scopes (oauth scopes such as `delete public images` or `register user`)
- voters (supply a list of functions to vote on a decision about a subject's
  accessibility)

```ts
  @post('/users/{userId}/orders', {
    responses: {
      '200': {
        description: 'User.Order model instance',
        content: {'application/json': {schema: {'x-ts-type': Order}}},
      },
    },
  })
  @authenticate('jwt')
  @authorize({resource: 'order', scopes: ['create']})
  async createOrder(
    @param.path.string('userId') userId: string,
    @requestBody() order: Order,
  ): Promise<Order> {
    await this.userRepo.orders(userId).create(order);
  }
```

Please note that `@authorize` can also be applied at class level for all methods
within the class. In the code below remote method `numOfViews()` is protected
with `ADMIN` role, while authorization for remote method `hello()` is skipped by
`@authorize.skip()`.

```ts
@authorize({allowedRoles: ['ADMIN']})
export class MyController {
  @get('/number-of-views')
  numOfViews(): number {
    return 100;
  }

  @authorize.skip()
  @get('/hello')
  hello(): string {
    return 'Hello';
  }
}
```
