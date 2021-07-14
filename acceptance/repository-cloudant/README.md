# @loopback/test-repository-cloudant

Acceptance tests for `@loopback/repository` + `loopback-connector-cloudant`.

## Running the test suite

### Using own Cloudant instance

If you have a local or remote Cloudant instance and would like to use that to
run the test suite, use the following command:

**Linux & MacOS**

```bash
CLOUDANT_URL=<URL> CLOUDANT_HOST=<HOST> CLOUDANT_PORT=<PORT> CLOUDANT_USERNAME=<USER> CLOUDANT_PASSWORD=<PASSWORD> CLOUDANT_DATABASE=<DATABASE> npm test
```

**Windows**

```bash
SET CLOUDANT_URL=<URL>
SET CLOUDANT_HOST=<HOST>
SET CLOUDANT_PORT=<PORT>
SET CLOUDANT_USERNAME=<USER>
SET CLOUDANT_PASSWORD=<PASSWORD>
SET CLOUDANT_DATABASE=<DATABASE>
npm test
```

### Using Docker (Linux, MacOS, WSL)

If you do not have a local Cloudant instance, you can also run the test suite
with very minimal requirements. We use couchDB docker image to run the test
locally.

NOTICE: we use `couchDB3` docker image for testing Cloudant because Cloudant
doesn't have a maintained image, and most of the their functionalities are the
same (except couchDB doesn't support geosearch).

- Install [Docker](https://docs.docker.com/engine/installation/).

- Run the following script

  ```bash
  . setup.sh <HOST> <PORT> <USER> <PASSWORD> <DATABASE>
  ```

  Where `<HOST>`, `<PORT>`, `<USER>`, `<PASSWORD>` and `<DATABASE>` are optional
  parameters. The default values are `localhost`, `5984`, `admin`, `pass` and
  `testdb` respectively.

- The `<USER>` and `<PASSWORD>` you set above will be the admin/password of this
  couchDB3 container.

- Run the test:

  ```bash
  npm test
  ```

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
