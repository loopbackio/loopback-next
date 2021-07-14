---
lang: en
title: 'Migrating OAuth2 provider'
keywords:
  LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-auth-oauth2.html
---

[`loopback-component-oauth2`](https://github.com/strongloop/loopback-component-oauth2)
is used to setup a LoopBack application as an [OAuth 2.0](https://oauth.net/2/)
server. It can be applied when people implement their LoopBack application as an
OAuth 2.0 provider. For example, the API gateway application.

As of now, LoopBack 4 focuses on redirecting to third-party OAuth2 providers
like [Google](https://developers.google.com/identity/protocols/oauth2) or
[Facebook](https://developers.facebook.com/docs/facebook-login/) for
authentication and authorization, instead of turning itself into an OAuth 2.0
provider. And given the complexity of
[`loopback-component-oauth2`](https://github.com/strongloop/loopback-component-oauth2),
we decide to defer the migration guide for it.

We have a simplified OAuth 2.0 server implementation in extension
[authentication-passport](https://github.com/strongloop/loopback-next/blob/master/extensions/authentication-passport)'s
test fixtures, which sets up an Express application as an OAuth 2.0 provider.
You can find the code in file
[mock-oauth2-provider](https://github.com/strongloop/loopback-next/blob/master/fixtures/mock-oauth2-provider).
At this moment people who are interested to create such a provider can use it as
a reference.
