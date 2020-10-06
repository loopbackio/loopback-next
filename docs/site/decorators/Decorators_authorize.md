---
lang: en
title: 'Authorization Decorators'
keywords:
  LoopBack 4.0, LoopBack, Node.js, TypeScript, OpenAPI, Decorator, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Decorators_authorize.html
---

## Authorization Decorator

Syntax:

- `@authorize({resource: 'order', scopes: ['create']})`

The authorization decorator is used to provide access control metadata. As part
of the component [`@loopback/authorization`](../Authorization-component.md), it
is applied to controller members and is used to specify who can perform which
operations to the protected resource.

The `@authorize` decorator takes in an object in type `AuthorizationMetadata`.
The syntax example specifies the `resource` and `scopes`. A full list of the
available configuration properties are:

- `allowedRoles`/`deniedRoles`: Define the ACL based roles. It should be an
  array of strings.
- `voters`: Supply a list of functions to vote on a decision about a subject's
  accessibility. A voter is a method or class level
  [authorizer](../Authorization-component-authorizer.md).
- `resource`: Type of the protected resource, such as customer or order.
- `scopes`: An array of the operations against the protected resource, such as
  get or delete.
- `skip`: A boolean value to mark an endpoint/a controller skips the
  authorization.

### Method Level Decorator

You can decorate a controller method with `@authorize` like the following
example. It specifies every user can create a new order.

{% include code-caption.html content="src/controllers/order.controller.ts" %}

```ts
class OrderController {
  orders: Order[] = [];
  // User with role 'everyone' can create new order
  @authorize({
    allowedRoles: ['everyone'],
    scopes: ['create'],
    resource: 'order',
  })
  async placeOrder(order: Order) {
    order.id = `order-${this.orders.length + 1}`;
    this.orders.push(order);
    return order.id;
  }
}
```

### Class Level Decorator

To configure a default authorization for all methods within a class,
`@authorize` can also be applied at the class level. In the code below, remote
method `numOfViews()` is protected with `ADMIN` role, while authorization for
remote method `hello()` is skipped by the use of `@authorize.skip()`.

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

### Shortcuts

We have a list of shortcut decorators to quickly configure the metadata. For
instance, `authorize.allow(...roles: string[]` is short for
`authorize({allowedRoles: roles})`;

You can find all the shortcuts in the
[`@authorize()` API documentation](https://loopback.io/doc/en/lb4/apidocs.authorization.authorize.html#variables).
