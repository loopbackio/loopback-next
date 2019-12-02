---
lang: en
title:
  'Migrating authentication and authorization for an example LoopBack 3
  application'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3, Migration
sidebar: lb4_sidebar
permalink: /doc/en/lb4/migration-auth-example.html
---

## Example LoopBack 3 application

- https://github.com/strongloop/loopback-example-access-control

## Migration to LoopBack 4

1. Set up `/login` endpoint

2. Set up authentication

- Authentication action
- `@authenticate`
- Authentication strategies

3. Set up authorization

- Migrate ACLs -> `@authorize`
- Migrate custom role resolvers -> `Authorizer` or `Voter`

## Use a third party library as the authorizer

- Casbin

## Use a third party service as the authorizer

- Auth0
