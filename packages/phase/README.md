# @loopback/phase

This module defines `Phase` and `PhaseList` to organize a list of handlers by
groups. It's rewritten in TypeScript based on
https://github.com/strongloop/loopback-phase.

## Installation

```sh
npm install --save @loopback/phase
```

## Basic Use

### Handler

A handler is a function that takes a `Context` object, an optional
`HandlerChain` object and returns a `Promise`.

When a handler is invoked as part of a chain, it can control how to proceed as
follows:

- Continue to invoke downstream handlers after it exits

```ts
async ctx => {
  console.log(ctx.req.url);
};
```

- Invoke downstream handlers within the method in cascading style

```ts
async (ctx, chain) => {
  const start = process.hrtime();
  await chain!.next();
  const duration = process.hrtime(start);
  console.log('Duration: ', duration);
};
```

- Terminate the handler chain and return

```ts
async (ctx, chain) => {
  if (ctx.req.url === '/status') {
    ctx.response = {status: 'ok'};
    chain!.return();
  }
};
```

- Abort the handler chain by throwing an error

```ts
async (ctx, chain) => {
  throw new Error('invalid request');
  // or
  // chain!.throw(new Error('invalid request'));
};
```

### Phase

A `Phase` is a bucket for organizing handlers. Each phase has an `id` and three
sub-phases:

- before (contains handlers to be invoked before the phase)
- use (contains handlers to be invoked during the phase)
- after (contains handlers to be invoked after the phase)

The handlers within the same subphase will be executed in serial or parallel
depending on the `options.parallel` flag, which is default to `false`.

The three sub-phases within the same phase will be executed in the order of
`before`, `use`, and `after`.

There is also a `failFast` option to control how to handle errors. If `failFast`
is set to `false`, errors will be caught and set on the `ctx.error` without
aborting the handler chain.

### PhaseList

A `PhaseList` is an ordered list of phases. Each phase is uniquely identified by
its id within the same `PhaseList`. The `PhaseList` provides methods to manage
phases, such as adding a phase before or after another phase.

In addition to the regular phases, each `PhaseList` has two built-in phases:

- errorPhase (`$error`)
- finalPhase (`$final`)

The PhaseList is a chain of grouped list of handlers. When the handler chain is
invoked with a given context, it passes control to handlers registered for each
regular phase one by one sequentially until a handler changes the process by
cascading, returning, or aborting. The flow is very similar as:

```ts
try {
  // await run handlers for phase 1
  // await run handlers for phase 2
  // ...
  // await run handlers for phase N
} catch (e) {
  // await run handlers for errorPhase
} finally {
  // await run handlers for finalPhase
}
```

### Pass information across handlers

The `Context` object can be used to pass data across handlers following the
handler chain so that downstream handlers can access such information populated
by upstream handlers. For cascading handlers, it's also possible to receive data
from downstream handlers after calling `await ctx.handlerChain.next()`.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
