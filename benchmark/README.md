# benchmark

Benchmarks for LoopBack framework.

## Results

MacBookPro Mid 2015 Processor: 2.5 GHz Intel Core i7 Memory: 16 GB 1600 MHz DDR3

### Requests per seconds

_Average number of requests handled every second._

| scenario          |  rps |
| ----------------- | ---: |
| find all todos    | 6230 |
| create a new todo |  377 |

### Latency

_Average time to handle a request in milliseconds._

| scenario          | latency |
| ----------------- | ------: |
| find all todos    |    1.11 |
| create a new todo |   26.03 |

## Basic use

Install all dependencies.

```
$ npm install
```

Run the tests to verify the benchmarked scenarios are working correctly.

```
$ npm test
```

Run the benchmark.

```
$ npm start
```

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
