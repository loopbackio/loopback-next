# benchmark

Benchmarks for LoopBack framework.

## Results

MacBookPro Early 2015 Processor: 2.5 GHz Intel Core i5 Memory: 8 GB 1867 MHz
DDR3

### Requests per seconds

_Average number of requests handled every second._

| scenario          |  rps |
| ----------------- | ---: |
| find all todos    | 2620 |
| create a new todo | 2603 |

### Latency

_Average time to handle a request in milliseconds._

| scenario          | latency |
| ----------------- | ------: |
| find all todos    |    3.31 |
| create a new todo |    3.35 |

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

- [Guidelines](https://github.com/loopbackio/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/loopbackio/loopback-next/issues/110)

## Contributors

See
[all contributors](https://github.com/loopbackio/loopback-next/graphs/contributors).

## License

MIT
