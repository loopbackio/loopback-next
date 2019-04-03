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

See [Differences between LoopBack v3 and v4](LoopBack-3.x.md).
