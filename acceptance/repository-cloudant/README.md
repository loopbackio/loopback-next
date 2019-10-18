# @loopback/test-repository-cloudant

Acceptance tests for `@loopback/repository` + `loopback-connector-cloudant`.

## Running the test suite

### Using own Cloudant instance

If you have a local Cloudant instance listening on `localhost` and the default
port, with a `root` user and an empty password, use the following command:

```bash
npm test
```

If you have a local or remote Cloudant instance and would like to use that to
run the test suite, use the following command:

**Linux & MacOS**

```bash
CLOUDANT_URL=<URL> CLOUDANT_HOST=<HOST> CLOUDANT_PORT=<PORT> CLOUDANT_USER=<USER> CLOUDANT_PASSWORD=<PASSWORD> CLOUDANT_DATABASE=<DATABASE> npm test
```

**Windows**

```bash
SET CLOUDANT_HOST=<HOST>
SET CLOUDANT_PORT=<PORT>
SET CLOUDANT_USER=<USER>
SET CLOUDANT_PASSWORD=<PASSWORD>
SET CLOUDANT_DATABASE=<DATABASE>
npm test
```

### Using Docker (Linux, MacOS, WSL)

If you do not have a local Cloudant instance, you can also run the test suite
with very minimal requirements.

- Assuming you have [Docker](https://docs.docker.com/engine/installation/)
  installed, run the following script which would spawn a Cloudant instance on
  your local:

  ```bash
  source setup.sh <URL> <HOST> <PORT> <USER> <PASSWORD> <DATABASE>
  ```

  Where `<URL>`, `<HOST>`, `<PORT>`, `<USER>`, `<PASSWORD>` and `<DATABASE>` are
  optional parameters. The default values are `url`, `localhost`, `3306`,
  `root`, `pass` and `testdb` respectively.

- Run the test:

  ```bash
  npm test
  ```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
