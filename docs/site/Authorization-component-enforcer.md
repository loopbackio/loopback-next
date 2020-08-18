---
lang: en
title: 'Authorization Component - Enforcer Libraries'
keywords: LoopBack 4.0, LoopBack 4, Node.js, TypeScript, OpenAPI, Authorization
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Authorization-component-enforcer.html
---

Enforcer libraries help developers in coding security policies as configurations
and provides out-of-the-box matching rules, strategies and authorization
patterns. These libraries also help with mundane tasks like mapping user
profiles to scopes and roles, modifying configurations dynamically, etc. Please
look at the
[loopback shopping example](https://github.com/strongloop/loopback4-example-shopping)
to see how [CasBin library](https://github.com/casbin/casbin) is
[injected as an enforcer](https://github.com/strongloop/loopback4-example-shopping/pull/231)
into the authorization provider.

```ts
import * as casbin from 'casbin';

// Class level authorizer
export class CasbinAuthorizationProvider implements Provider<Authorizer> {
  constructor(@inject('casbin.enforcer') private enforcer: casbin.Enforcer) {}

  /**
   * @returns authorizeFn
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {

    /*
    * call enforcer and determine action
    */
    return AuthorizationDecision.ABSTAIN;
  }
```
