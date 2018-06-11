# @loopback/dist-util

Utilities to work with `dist` folders used by different Node.js versions.

| version | directory       |
| ------- | --------------- |
| 6.x LTS | _not supported_ |
| 8.x LTS | `dist8`         |
| 9.x     | `dist8`         |
| 10.x    | `dist10`        |
| newer   | `dist10`        |

## Installation

Run the following command to install this package:

```
$ npm install @loopback/dist-util
```

## Basic Use

Configure your TypeScript build to produce two distribution versions:

- `dist8` compiled for `es2017` target
- `dist10` compiled for `es2018` target

Put the following line to your main `index.js` file:

```js
module.exports = require('@loopback/dist-util').loadDist(__dirname);
// calls `require(__dirname + '/dist8')` or `require(__dirname + '/dist10')`
```

It is also possible to obtain the name of the correct `dist` directory without
loading the dist files:

```js
const dist = require('@loopback/dist-util').getDist();
console.log(dist);
// prints `dist8` or `dist10`
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
