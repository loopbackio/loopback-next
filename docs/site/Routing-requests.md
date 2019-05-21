---
lang: en
title: 'Routing requests'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Routing-requests.html
---

## Routing Requests

This is an action in the default HTTP sequence. Its responsibility is to find a
route that can handle a given http request. By default, the `FindRoute` action
uses the `RoutingTable` from `@loopback/rest` to match requests against
registered routes including controller methods using `request.method` and
`request.path`. For example:

- GET /orders => OrderController.getOrders (`@get('/orders')`)
- GET /orders/123 => OrderController.getOrderById (`@get('/orders/{id}')`)
- GET /orders/count => OrderController.getOrderCount (`@get('/orders/count')`)
- POST /orders => OrderController.createOrder (`@post('/orders')`)

## Customize the `FindRoute` action

The `FindRoute` action is bound to `SequenceActions.FIND_ROUTE`
('rest.sequence.actions.findRoute') and injected into the default sequence.

To create your own `FindRoute` action, bind your implementation as follows:

```ts
const yourFindRoute: FindRoute = ...;
app.bind(SequenceActions.FIND_ROUTE).to(yourFindRoute);
```

## Customize the REST Router

Instead of rewriting `FindRoute` action completely, LoopBack 4 also allows you
to simply replace the `RestRouter` implementation.

The `@loopback/rest` module ships two built-in routers:

- TrieRouter: it keeps routes as a `trie` tree and uses traversal to match
  `request` to routes based on the hierarchy of the path
- RegExpRouter: it keeps routes as an array and uses `path-to-regexp` to match
  `request` to routes based on the path pattern

For both routers, routes without variables are optimized in a map so that any
requests matching to a fixed path can be resolved quickly.

By default, `@loopback/rest` uses `TrieRouter` as it performs better than
`RegExpRouter`. There is a simple benchmarking for `RegExpRouter` and
`TrieRouter` at
https://githhub.com/strongloop/loopback-next/benchmark/src/rest-routing/routing-table.ts.

To change the router for REST routing, we can bind the router class as follows:

```ts
import {RestBindings, RegExpRouter} from '@loopback/rest';
app.bind(RestBindings.ROUTER).toClass(RegExpRouter);
```

It's also possible to have your own implementation of `RestRouter` interface
below:

```ts
/**
 * Interface for router implementation
 */
export interface RestRouter {
  /**
   * Add a route to the router
   * @param route - A route entry
   */
  add(route: RouteEntry): boolean;

  /**
   * Find a matching route for the given http request
   * @param request - Http request
   * @returns The resolved route, if not found, `undefined` is returned
   */
  find(request: Request): ResolvedRoute | undefined;

  /**
   * List all routes
   */
  list(): RouteEntry[];
}
```

See examples at:

- [TrieRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/trie-router.ts)
- [RegExpRouter](https://github.com/strongloop/loopback-next/tree/master/packages/rest/src/router/regexp-router.ts)
