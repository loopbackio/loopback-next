---
lang: en
title: Example Projects
keywords: LoopBack 4.0
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Examples.html
---

LoopBack 4 comes with the following example projects:

- **[hello-world](https://github.com/strongloop/loopback-next/tree/master/examples/hello-world)**:
  An example showing how to set up a simple application using LoopBack 4.

- **[context](https://github.com/strongloop/loopback-next/tree/master/examples/context)**:
  Standalone examples showing how to use
  [`@loopback/context`](https://github.com/strongloop/loopback-next/tree/master/packages/context)
  as an Inversion of Control (IoC) and Dependency Injection (DI) container.

- **[rpc-server](https://github.com/strongloop/loopback-next/tree/master/examples/rpc-server)**:
  An example showing how to implement a made-up RPC protocol.

- **[greeter-extension](https://github.com/strongloop/loopback-next/tree/master/examples/greeter-extension)**:
  An example showing how to implement the extension point/extension pattern.

- **[greeting-app](https://github.com/strongloop/loopback-next/tree/master/examples/greeting-app)**:
  An example showing how to compose an application from component and
  controllers, interceptors, and observers.

- **[loopback4-example-shopping](https://github.com/strongloop/loopback4-example-shopping)**:
  An online e-commerce demo to validate/test the LoopBack 4 framework readiness.

You can download the example projects using our CLI tool `lb4`:

```sh
lb4 example <example-name>
```

For example, the following command downloads the `hello-world` example into
`loopback4-example-hello-world`.

```sh
lb4 example hello-world
```

Please follow the instructions in
[Install LoopBack4 CLI](Getting-started.md#install-loopback-4-cli) if you don't
have `lb4` installed yet.
