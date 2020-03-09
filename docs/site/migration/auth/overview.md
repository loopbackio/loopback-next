---
lang: en
title: 'Migrating authentication and authorization'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-auth-overview.html
---

{% include tip.html content="
Missing instructions for your LoopBack 3 use case? Please report a [Migration docs issue](https://github.com/strongloop/loopback-next/issues/new?labels=question,Migration,Docs&template=Migration_docs.md) on GitHub to let us know.
" %}

LoopBack version 3 provides several options for adding authentication and
authorization to secure the applications:

- A set of built-in models like `User`, `AccessToken` and `ACL` makes it easy to
  store your user credentials locally and define custom access control checks.
  The migration path is described in
  [Migrating built-in authentication and authorization](./built-in.md).

- [loopback-component-passport](https://github.com/strongloop/loopback-component-passport)
  provides integration between LoopBack 3 and
  [Passport](http://www.passportjs.org) to support third-party login and account
  linking for LoopBack applications. The migration path is described in
  [Migrating Passport-based authentication](./passport.md).

- [loopback-component-oauth2](https://github.com/strongloop/loopback-component-oauth2)
  provides full integration between OAuth 2.0 and LoopBack. It enables LoopBack
  applications to function as an oAuth 2.0 provider to authenticate and
  authorize client applications and/or resource owners (i.e. users) to access
  protected API endpoints. The migration path is described in
  [Migrating OAuth2 provider](./oauth2.md).

- [loopback-example-access-control](https://github.com/strongloop/loopback-example-access-control)
  demonstrate authentication and authorization mechanisms in LoopBack. The
  migration guide is described in
  [Migrating access control example](./example.md).
