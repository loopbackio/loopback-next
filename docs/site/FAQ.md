---
lang: en
title: 'Frequently-asked questions'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/FAQ.html
summary: LoopBack 4 is a completely new framework, also known as LoopBack-Next.
---

### What’s the vision behind LoopBack 4?

- Make it even easier to build apps that require complex integrations
- Enabling an ecosystem of extensions
- Small, fast, flexible, powerful core
- Suitable for small and large teams
- Minimally opinionated, enforce your team's opinions instead

See [Crafting LoopBack 4](Crafting-LoopBack-4.md) for more details.

### Where are the tutorials?

See [Examples](Examples.md) and [Tutorials](Tutorials.md).

### What features are planned?

Our roadmap is captured in
[here](https://github.com/strongloop/loopback-next/labels/roadmap). You can also
check out our
[monthly milestone plans](https://github.com/strongloop/loopback-next/labels/Monthly%20Milestone).

For LoopBack 3 users, here is the list of LB3 feature parity we wish to be
implemented in the future:
https://github.com/strongloop/loopback-next/issues/1920.

Do you have some other features in mind? Add your feature requests at
[loopback-next/issues/new](https://github.com/strongloop/loopback-next/issues/new).

### Why TypeScript?

Although developers can still write application logic in either JavaScript or
TypeScript, LoopBack 4's core is written in TypeScript, for the following
reasons:

- **Improved developer productivity and scalability**. Our customers need a
  framework that scales to dozens and even hundreds of developers. This
  scalability is the reason TypeScript exists and is gaining traction.
- **Improved extensibility** and flexibility. LoopBack 4's core is simpler than
  LoopBack 3.x with well-defined extension points. A lot of responsibility will
  be shifted to extensions (components), which can be JavaScript or TypeScript.
- Unified tooling. TypeScript developers all use the same IDE: Visual Studio
  Code. The LoopBack ecosystem could someday be filled with useful best
  practices around that IDE and even great developer plugins. Right now that
  effort is split between various editors and basically non-existent.
- **Future-proofing**. Ability to leverage the latest and future JavaScript
  constructs.

TypeScript's support for static analysis makes more robust tooling possible and
is the foundation for its scalability. The ability to easily refactor code
without the common human-introduced errors. Dev and Compile time checking. For
example, most people don't have the same expertise and time we do to setup
complex linting solutions (for example, a linting config that works across many
projects).

For more details, see the lengthy discussion in
[#6](https://github.com/strongloop/loopback-next/issues/6).

### Does JavaScript still work?

LoopBack 4 itself is written in [TypeScript](https://www.typescriptlang.org)
(that compiles to JavaScript), but it supports applications written in both
TypeScript and JavaScript. The documentation assumes you have a basic
understanding of the JavaScript language; and when it says "JavaScript" it is
understood to mean ECMAScript version 6 (ES6).

Some of the examples use ES6 syntax. We encourage you to get familiar with ES6
constructs such as arrow functions, classes, template literals, let, and const
statements.

### LoopBack 3 vs LoopBack 4

We recommend that current users migrate to LoopBack 4, which can be done through
following the [migration guide](migration/overview.md) and new users start with
LoopBack 4. See
[Differences between LoopBack v3 and v4](Understanding-the-differences.md) if
you're interested in the differences between the two versions.

### How do I disable the API Explorer?

LoopBack provides a self-hosted and a redirect to an
[external API Explorer](https://explorer.loopback.io).

Documentation to disable both API Explorers:

- [Disable redirect to API Explorer](https://loopback.io/doc/en/lb4/Server.html#disable-redirect-to-api-explorer)
- [Disable Self-Hosted API Explorer](https://loopback.io/doc/en/lb4/Self-hosted-rest-api-explorer.html#disable-self-hosted-api-explorer)

### How do I send a custom response?

#### Return a custom response body

The response is usually determined by value returned by the controller function
that's invoked. A good example of this is the default `PingController`
scaffolded with every LoopBack 4 application:

```ts
// Note: code shortened for bevity

// Map to `GET /ping`
@get('/ping', {
  responses: {
    '200': PING_RESPONSE,
  },
})
ping(): object {
  // Reply with a greeting, the current time, the url, and request headers
  return {
    greeting: 'Hello from LoopBack',
    date: new Date(),
    url: this.req.url,
    headers: Object.assign({}, this.req.headers),
  };
}
}

```

In this example, we can see that the `ping()` function returns a custom object.
This would be reflected in the response body when an API consumer makes a
request to `/ping`.

#### Further customize the response

Sometimes, other parts of the response needs to be modified (such as the HTTP
headers). This can be accomplished by injecting the `Response` object into the
controller:

```ts
import {inject} from '@loopback/context';
import {get, Response, RestBindings} from '@loopback/rest';

export class PingController {
  constructor(@inject(RestBindings.Http.RESPONSE) private res: Response) {}

  // Map to `GET /ping`
  @get('/ping', {
    responses: {
      '200': {
        description: 'Ping Response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              title: 'PingResponse',
              properties: {
                greeting: {type: 'string'},
                additionalProperties: false,
              },
            },
          },
        },
      },
    },
  })
  ping(): object {
    this.res.setHeader('x-secret-sauce', 'Sugar, spice and everything nice.');

    // Reply with a greeting
    return {
      greeting: 'Hello from LoopBack',
    };
  }
}
```

This will result in a custom response body and a new header, `x-secret-sauce`.

{% include note.html content="While LoopBack 4 currently doesn't validate the server response against the OpenAPI Spec, it's a good idea to keep the `responses` object in-line with the actual responses (as shown in the code above) to prevent API consumers and OAS 3 generators from being misled into expecting a different response." %}

### Where do I find the default binding keys?

Binding keys used by `@loopback/*` packages are consolidated under
[Reserved binding keys](Reserved-binding-keys.md).

### What is the difference between general and configuration bindings?

Configuration bindings are APIs that leverage the general binding API to
standardize the naming convention of the configuration binding keys needing to
create a completely separate key. See
[Configuration by convention](https://loopback.io/doc/en/lb4/Context.html#configuration-by-convention).

### Can I attach an Express router?

Yes. See [Mounting an Express Router](Routes.md#mounting-an-express-router).

### Can I mount an Express middleware?

Yes. See [Using Express Middleware](Express-middleware.md).
