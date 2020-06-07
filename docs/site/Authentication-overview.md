---
lang: en
title: 'LoopBack 4 Authentication Overview'
keywords: LoopBack 4.0, LoopBack 4, Authentication
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authentication-overview.html
---

Security is of paramount importance when developing a web or mobile application
and usually consists of two distinct pieces:

- Authentication
- Authorization

Authentication is a process of verifying user/entity to the system, which
enables identified/validated access to the protected routes.

Authorization is a process of deciding if a user can perform an action on a
protected resource.

{% include note.html content=" For a description of an Authorization process, please see [Authorization](Loopback-component-authorization.md). " %}

This document gives you an overview of the authentication system provided in
LoopBack 4.

Let's start with the following scenario: Suppose you want to secure endpoint
`GET /todo` using a
[JWT(JSON web token)](https://github.com/auth0/node-jsonwebtoken#readme)
strategy. The diagram below shows how such authentication process works with
LoopBack's authentication mechanism.

![authentication_overview_request_handle_flow](./imgs/authentication/authentication-overview.png)

As illustrated above, an access token in Authorization header in making request
to the route is handled by the REST server's sequence, which invokes the
authentication action to decode the user profile from token so that controllers
can have the user injected.

For implementing this, all you need to add is the code in programming colors:

- Register the authentication component and JWT extension in your application.
- Enable the authenticate action in sequence.
- Decorate the controller endpoint with `@authenticate()` and inject the user
  passed from the authentication layer.

The rest will be handled by our authentication component
`@loopback/authentication`, which incorporates the authentication mechanism, and
the JWT extension `@loopback/jwt-authentication`, which helps in implementing
JWT-based authentication to the system and should be provided by extension
developers.

The authentication system is highly extensible and pluggable. It's easy to get
started with. While there are more advanced features to explorer - of which are
beneficial when you build more complicated and larger scale applications. it
requires understanding the mechanics of the system, like how component
`@loopback/authentication` works. To help you learn the full features gradually,
we've broken down the documentations into several parts:

- [**JWT todo example**](./tutorials/authentication/Authentication-Tutorial.md):
  A tutorial to get started by applying the JWT authentication in the
  [todo example](https://loopback.io/doc/en/lb4/todo-tutorial.html).
- Understand the modules provided out-of-the-box:
  - [**Authentication component**](missing_link): A deep dive of component
    `@loopback/authentication`
  - [**JWT extension**](JWT-authentication-extension.md): A prototype
    implementation of the JWT authentication.
- [**How to create your own authentication strategy**](Create-custom-authentication-strategy.md):
  Particularly for extension developers.
- [Use [**Passport**](https://www.npmjs.com/package/passport) strategies](Authentication-passport.md):
  The usage of passport adapter module `@loopback/authentication-passport`.
