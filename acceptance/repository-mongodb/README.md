# @loopback/test-repository-mongodb

Acceptance tests for `@loopback/repository` + `loopback-connector-mongodb`.

## Running the test suite

### Using own MongoDB instance

If you have a local MongoDB instance listening on `localhost` and the default
port, use the following command:

```bash
npm test
```

If you have a local or remote MongoDB instance and would like to use that to run
the test suite, use the following command:

**Linux & MacOS**

```bash
MONGODB_HOST=<HOST> MONGODB_PORT=<PORT> MONGODB_DATABASE=<DATABASE> npm test
```

**Windows**

```bash
SET MONGODB_HOST=<HOST>
SET MONGODB_PORT=<PORT>
SET MONGODB_DATABASE=<DATABASE>
npm test
```

### Using Docker (Linux, MacOS, WSL)

If you do not have a local MongoDB instance, you can also run the test suite
with very minimal requirements.

- Assuming you have [Docker](https://docs.docker.com/engine/installation/)
  installed, run the following script which would spawn a MongoDB instance on
  your local:

  ```bash
  source setup.sh <HOST> <PORT> <DATABASE>
  ```

  Where `<HOST>`, `<PORT>` and `<DATABASE>` are optional parameters. The default
  values are `localhost`, `27017` and `testdb` respectively.

- Run the test:

  ```bash
  npm test
  ```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
