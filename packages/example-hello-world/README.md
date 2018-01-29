# @loopback/example-hello-world

## Summary

A simple hello-world application using LoopBack 4!

## Prerequisites

Before we can begin, you'll need to make sure you have some things installed:
- [Node.js](https://nodejs.org/en/) at v6.x or greater

Additionally, this tutorial assumes that you are comfortable with
certain technologies, languages and concepts.
- JavaScript (ES6)
- [npm](https://www.npmjs.com/)
- [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)

## Installation

1. Install the new loopback CLI toolkit.
```
npm i -g @loopback/cli
```

2. Download the "hello-world" application.
```
lb4 example hello-world
```

3. Switch to the directory and install dependencies.
```
cd loopback-example-hello-world && npm i
```

## Use

Start the app:

```
npm start
```

The application will start on port `3000`. Use your favourite browser or REST
client to access any path with a GET request, and watch it return `Hello world!`.

