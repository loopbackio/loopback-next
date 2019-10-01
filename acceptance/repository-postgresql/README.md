# @loopback/test-repository-postgresql

Acceptance tests for `@loopback/repository` + `loopback-connector-postgresql`.

## Running the test suite

### Using own PostgreSQL instance

If you have a local PostgreSQL instance listening on `localhost` and the default
port, with a `root` user and an empty password, use the following command:

```bash
npm test
```

If you have a local or remote PostgreSQL instance and would like to use that to
run the test suite, use the following command:

**Linux & MacOS**

```bash
POSTGRESQL_HOST=<HOST> POSTGRESQL_PORT=<PORT> POSTGRESQL_USER=<USER> POSTGRESQL_PASSWORD=<PASSWORD> POSTGRESQL_DATABASE=<DATABASE> npm test
```

**Windows**

```bash
SET POSTGRESQL_HOST=<HOST>
SET POSTGRESQL_PORT=<PORT>
SET POSTGRESQL_USER=<USER>
SET POSTGRESQL_PASSWORD=<PASSWORD>
SET POSTGRESQL_DATABASE=<DATABASE>
npm test
```

### Using Docker (Linux, MacOS, WSL)

If you do not have a local PostgreSQL instance, you can also run the test suite
with very minimal requirements.

- Assuming you have [Docker](https://docs.docker.com/engine/installation/)
  installed, run the following script which would spawn a PostgreSQL instance on
  your local:

  ```bash
  source setup.sh <HOST> <PORT> <USER> <PASSWORD> <DATABASE>
  ```

  Where `<HOST>`, `<PORT>`, `<USER>`, `<PASSWORD>` and `<DATABASE>` are optional
  parameters. The default values are `localhost`, `5432`, `root`, `pass` and
  both `repository_tests` and `repository_tests_new` respectively.

- Run the test:

  ```bash
  npm test
  ```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
