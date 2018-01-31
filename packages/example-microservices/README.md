# loopback-next-example

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback)

How to build scalable microservices using LoopBack.next.

> What's the difference between LoopBack.next and the current version of
> Loopback? See [LoopBack 3 vs LoopBack 4](https://github.com/strongloop/loopback-next/wiki/FAQ#loopback-3-vs-loopback-4).

## Installation

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) at v6.x or greater

1. Install the new loopback CLI toolkit.
```
npm i -g @loopback/cli
```

2. Download the "microservices" example.
```
lb4 example microservices
```

3. Switch to the directory and install dependencies.
```
cd loopback-example-microservices && npm install
```

## Basic use

```shell
# start all microservices
npm start

# perform GET request to retrieve account summary data
curl localhost:3000/account/summary?accountNumber=CHK52321122 # or npm test

# perform GET request to retrieve account data
curl localhost:3001/accounts?accountNumber=CHK52321122

# stop all microservices
npm stop
```

> Helper scripts for the above commands are in [`/bin`](https://github.com/strongloop/loopback-next-example/tree/master/bin)
directory.

# Contributing

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing)
- [Join the team](https://github.com/strongloop/loopback-next/wiki/Contributing#join-the-team)

# License

MIT
