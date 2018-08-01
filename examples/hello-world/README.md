# @loopback/example-hello-world

A simple hello-world application using LoopBack 4!

## Summary

This project shows how to write the simplest LoopBack 4 application possible.
Check out [src/application.ts](src/application.ts) to learn how we configured
our application to always respond with "Hello World!".

## Prerequisites

Before we can begin, you'll need to make sure you have some things installed:

- [Node.js](https://nodejs.org/en/) at v8.9 or greater

Additionally, this tutorial assumes that you are comfortable with certain
technologies, languages and concepts.

- JavaScript (ES6)
- [npm](https://www.npmjs.com/)
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)

## Installation

1.  Install the new loopback CLI toolkit.

```sh
npm i -g @loopback/cli
```

2.  Download the "hello-world" application.

```sh
lb4 example hello-world
```

3.  Switch to the directory.

```sh
cd loopback4-example-hello-world
```

## Use

Start the app:

```sh
npm start
```

The application will start on port `3000`. Use your favourite browser or REST
client to access any path with a GET request, and watch it return
`Hello world!`.

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
