# @loopback/test-extension-logging-fluentd

Acceptance tests for `@loopback/extension-logging` against a fluentd server.

## Running the test suite

### Prerequisite

- [Docker](https://docs.docker.com/engine/installation/) is installed.

### Run the test:

For mocha tests, we use
[testcontainers](https://github.com/testcontainers/testcontainers-node) to
start/stop the fluentd docker container automatically.

The fluentd configuration is read from `fixtures/etc/fluentd.conf`.

```bash
npm test
```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
