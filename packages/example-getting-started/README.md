# @loopback/example-getting-started

This is the basic tutorial for getting started with Loopback 4!

## Overview

This tutorial demonstrates how to create a basic API for a todo list using
LoopBack 4.

## Setup

You'll need to make sure you have some things installed:

- [Node.js](https://nodejs.org/en/) at v8.x or greater

Additionally, this tutorial assumes that you are comfortable with certain
technologies, languages and concepts.

- JavaScript (ES6)
- [REST](http://www.restapitutorial.com/lessons/whatisrest.html)

Lastly, you'll need to install the LoopBack 4 CLI toolkit:

```sh
npm i -g @loopback/cli
```

## Tutorial

To follow this tutorial, begin with the
[Create your app scaffolding](docs/scaffolding.md) section.

### Steps

1. [Create your app scaffolding](docs/scaffolding.md)
2. [Adding the legacy juggler](docs/juggler.md)
3. [Add your Todo model](docs/model.md)
4. [Add a datasource](docs/datasource.md)
5. [Add a repository](docs/repository.md)
6. [Add a controller](docs/controller.md)
7. [Putting it all together](docs/putting-it-together.md)

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

1. Run the `lb4 example` command to select and clone the getting-started
   repository:

```sh
$ lb4 example
? What example would you like to clone? (Use arrow keys)
❯ getting-started: An application and tutorial on how to build with LoopBack 4.
  hello-world: A simple hello-world Application using LoopBack 4
  log-extension: An example extension project for LoopBack 4
  rpc-server: A basic RPC server using a made-up protocol.
```

2. Jump into the directory and then install the required dependencies:

```sh
cd loopback4-example-getting-started && npm i
```

3. Finally, start the application!

```sh
$ npm start

Server is running on port 3000
```

Feel free to look around in the application's code to get a feel for how it
works, or if you're still interested in learning how to build it step-by-step,
then continue with this tutorial!

### Stuck?

Check out our [Gitter channel](https://gitter.im/strongloop/loopback) and ask
for help with this tutorial!

### Bugs/Feedback

Open an issue in [loopback-next](https://github.com/strongloop/loopback-next)
and we'll take a look!

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See [all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
