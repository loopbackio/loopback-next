---
lang: en
title: 'Configuration'
keywords: LoopBack 4.0, LoopBack 4
sidebar: lb4_sidebar
permalink: /doc/en/lb4/core-tutorial-part8.html
---

Configuration is applied to extension points, extensions, and services.

Taking the ChineseGreeter as an example, we can inject the configuration to
specify the greeting phrase or the name should come first.

```ts
/**
 * A greeter implementation for Chinese.
 */
@bind(asGreeter)
export class ChineseGreeter implements Greeter {
  language = 'zh';
  constructor(
    /**
     * Inject the configuration for ChineseGreeter
     */
    @config()
    private options: ChineseGreeterOptions = {nameFirst: true},
  ) {}
```

The code snippet below shows two examples:

1. `ChineseGreeter` that allows the style configuration
2. `GreetingService` that takes some options

```ts
export class GreetingService {
  constructor(
    /**
     * Inject a getter function to fetch greeters (bindings tagged with
     * `{[CoreTags.EXTENSION_POINT]: GREETER_EXTENSION_POINT_NAME}`)
     */
    @extensions()
    private getGreeters: Getter<Greeter[]>,
    /**
     * An extension point should be able to receive its options via dependency
     * injection.
     */
    @config()
    public readonly options?: GreetingServiceOptions,
  ) {}
}
```

---

Previous: [Part 7 - Interception and observation](./7-observation.md)

Next: [Part 9 - Boot by convention](./9-boot-by-convention.md)
