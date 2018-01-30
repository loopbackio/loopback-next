# loopback-next-example

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/strongloop/loopback)

How to build scalable microservices using LoopBack.next.

> What's the difference between LoopBack.next and the current version of
> Loopback? See [LoopBack 3 vs LoopBack 4](https://github.com/strongloop/loopback-next/wiki/FAQ#loopback-3-vs-loopback-4).

## Installation

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/download/) >= 7.0.0
- [TypeScript](https://www.typescriptlang.org/index.html#download-links) >= 2.0.0 `npm i -g typescript`
- [TypeScript Node](https://github.com/TypeStrong/ts-node#installation) >= 3.0.0 `npm i -g ts-node`

```shell
# install loopback-next-example
git clone https://github.com/strongloop/loopback-next-example
cd loopback-next-example
npm run build
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

# Team

Ritchie Martori|Simon Ho|Siddhi Pai|Mahesh Patsute|Deepak Rajamohan
:-:|:-:|:-:|:-:|:-:
[<img src="https://avatars2.githubusercontent.com/u/462228?v=3&s=60">](http://github.com/ritch)|[<img src="https://avatars1.githubusercontent.com/u/1617364?v=3&s=60">](http://github.com/superkhau)|[<img src="https://avatars0.githubusercontent.com/u/15273582?v=3&u=d53eb3a459e72484c0ffed865c4e41f9ed9b4fdf&s=60">](http://github.com/siddhipai)|[<img src="https://avatars3.githubusercontent.com/u/24725376?v=3&s=60">](http://github.com/mpatsute)|[<img src="https://avatars2.githubusercontent.com/u/7688315?v=3&s=60">](http://github.com/deepakrkris)

[See all contributors](https://github.com/strongloop/loopback-next-example/graphs/contributors)

# Contributing

- [Guidelines](https://github.com/strongloop/loopback-next/wiki/Contributing)
- [Join the team](https://github.com/strongloop/loopback-next/wiki/Contributing#join-the-team)

# License

MIT
