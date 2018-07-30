---
lang: en
title: Examples and tutorials
keywords: LoopBack 4.0
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Examples-and-tutorials.html
---

LoopBack 4 comes with the following example projects:

- **[hello-world](https://github.com/strongloop/loopback-next/tree/master/examples/hello-world)**:
  Tutorial on setting up a simple hello-world application using LoopBack 4.

- **[todo](todo-tutorial.md)**: Tutorial on building a simple application with
  LoopBack 4 key concepts using bottom-up approach.

- **[todo-list](todo-list-tutorial.md)**: Tutorial on introducing related models
  and building their API from the Todo tutorial

- **[log-extension](https://github.com/strongloop/loopback-next/tree/master/examples/log-extension)**:
  Tutorial on building a log extension.

- **[rpc-server](https://github.com/strongloop/loopback-next/tree/master/examples/rpc-server)**:
  An example showing how to implement a made-up RPC protocol.

You can download any of the example projects usig our CLI tool `lb4`:

```sh
$ lb4 example
? What example would you like to clone? (Use arrow keys)
> todo: Tutorial example on how to build an application with LoopBack 4.
  todo-list: Continuation of the todo example using relations in LoopBack 4.
  hello-world: A simple hello-world Application using LoopBack 4.
  log-extension: An example extension project for LoopBack 4.
  rpc-server: A basic RPC server using a made-up protocol.
```

Please follow the instructions in
[Install LoopBack4 CLI](Getting-started.md#install-loopback-4-cli) if you don't
have `lb4` installed yet.
