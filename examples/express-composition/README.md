# @loopback/example-express-composition

This is an example of how to mount LoopBack 4 REST API on a simple
[Express](https://expressjs.com) application.

## Setup

First, you'll need to install a supported version of Node:

- [Node.js](https://nodejs.org/en/) at v8.9 or greater

Additionally, this tutorial assumes that you are comfortable with certain
technologies, languages and concepts.

- JavaScript (ES6)
- [REST](http://www.restapitutorial.com/lessons/whatisrest.html)

Lastly, you'll need to install the LoopBack 4 CLI toolkit:

```sh
npm i -g @loopback/cli
```

## Tutorial

Once you're ready to start, you can begin by visiting the
[tutorial](http://loopback.io/doc/en/lb4/express-with-lb4-rest-tutorial.html)
page.

## Try it out

If you'd like to see the final results of this tutorial as an example
application, follow these steps:

### Generate the example using CLI

1. Run the `lb4 example` command to select and clone the `express-composition`
   repository:

   ```sh
   $ lb4 example
   ? What example would you like to clone? (Use arrow keys)
    todo: Tutorial example on how to build an application with LoopBack 4.
    todo-list: Continuation of the todo example using relations in LoopBack 4.
    hello-world: A simple hello-world Application using LoopBack 4.
    log-extension: An example extension project for LoopBack 4.
    rpc-server: A basic RPC server using a made-up protocol.
    soap-calculator: An example on how to integrate SOAP web services.
   > express-composition: A simple Express application that uses LoopBack 4 REST API.
   ```

2. Jump into the directory and then install the required dependencies:

   ```sh
   cd loopback4-example-example-composition
   ```

3. Finally, start the application!

   ```sh
   $ npm start

   Server is running at http://127.0.0.1:3000
   ```

Feel free to look around in the application's code to get a feel for how it
works.

## Tests

Run `npm test` from the root folder.

## License

MIT
