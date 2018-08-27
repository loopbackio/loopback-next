# @loopback/example-soap-calculator

Integrating a Calculator SOAP web service with LoopBack 4.

## Overview

This example project shows how to integrate a SOAP web service with LoopBack 4
and expose its methods through the REST API server. Acceptance and Integration
tests are provided.

![soap-calculator-overview](https://loopback.io/pages/en/lb4/imgs/loopback-example-soap-calculator_figure1.png)

## Setup

You'll need to make sure you have some things installed:

- [Node.js](https://nodejs.org/en/) at v8.9 or greater

Lastly, you'll need to install the LoopBack 4 CLI toolkit:

```sh
npm i -g @loopback/cli
```

## Generate the example using CLI

1.  Run the `lb4 example` command to select and clone the soap-calculator
    repository:

```sh
$ lb4 example
? What example would you like to clone? (Use arrow keys)
  todo: Tutorial example on how to build an application with LoopBack 4.
  todo-list: Continuation of the todo example using relations in LoopBack 4.
  hello-world: A simple hello-world Application using LoopBack 4.
  log-extension: An example extension project for LoopBack 4.
  rpc-server: A basic RPC server using a made-up protocol.
> soap-calculator: An example on how to integrate SOAP web services.
```

2.  Jump into the directory and then install the required dependencies:

```sh
cd loopback4-example-soap-calculator
```

3.  Finally, start the application!

    ```sh
    $ npm start

    Server is running on port 3000
    ```

Feel free to look around in the application's code to get a feel for how it
works.

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

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
