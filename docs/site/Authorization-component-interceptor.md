---
lang: en
title: 'Authorization Component - Interceptor'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authorization-component-interceptor.html
---

The `Authorization Component` once registered binds an in-built interceptor to
all API calls.

The `Authorization interceptor` enforces authorization with user-provided
`authorizers/voters`

- The interceptor checks to see if an endpoint is annotated with an
  authorization specification.
- It collects all functions tagged as `Authorizer`. The interceptor also
  collects `voters` provided in the `@authorize` decorator of the endpoint.
- It executes each of the above collected functions provided by the user.
- Based on the result of all functions it enforces access/privilege control
  using [a decision matrix](#authorization-by-decision-matrix).
