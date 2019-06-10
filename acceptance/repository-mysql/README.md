# @loopback/test-repository-mysql

Acceptance tests for `@loopback/repository` + `loopback-connector-mysql`.

## Running the test suite

### Using own MySQL instance

If you have a local MySQL instance listening on `localhost` and the default
port, with a `root` user and an empty password, use the following command:

```bash
npm test
```

If you have a local or remote MySQL instance and would like to use that to run
the test suite, use the following command:

**Linux & MacOS**

```bash
MYSQL_HOST=<HOST> MYSQL_PORT=<PORT> MYSQL_USER=<USER> MYSQL_PASSWORD=<PASSWORD> MYSQL_DATABASE=<DATABASE> npm test
```

**Windows**

```bash
SET MYSQL_HOST=<HOST>
SET MYSQL_PORT=<PORT>
SET MYSQL_USER=<USER>
SET MYSQL_PASSWORD=<PASSWORD>
SET MYSQL_DATABASE=<DATABASE>
npm test
```

### Using Docker (Linux, MacOS, WSL)

If you do not have a local MySQL instance, you can also run the test suite with
very minimal requirements.

- Assuming you have [Docker](https://docs.docker.com/engine/installation/)
  installed, run the following script which would spawn a MySQL instance on your
  local:

  ```bash
  source setup.sh <HOST> <PORT> <USER> <PASSWORD> <DATABASE>
  ```

  Where `<HOST>`, `<PORT>`, `<USER>`, `<PASSWORD>` and `<DATABASE>` are optional
  parameters. The default values are `localhost`, `3306`, `root`, `pass` and
  `testdb` respectively.

- Run the test:

  ```bash
  npm test
  ```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
