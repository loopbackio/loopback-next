# smoke tests

The smoke tests run the `openapi` generator against real-world API specs listed
by https://api.apis.guru/v2/list.json.

## Basic use

`npm run smoke-test`

By default, it run tests against the following specs:

- https://api.apis.guru/v2/specs/api2cart.com/1.0.0/swagger.json
- https://api.apis.guru/v2/specs/amazonaws.com/codecommit/2015-04-13/swagger.json

The list of specs can be specified via environment variable `APIS`:

- `APIS=all npm run smoke-test`: run tests against all specs
- `APIS="<spec1-url> <spec2-url>" npm run smoke-test`: run tests against
  `<spec1-url>` and `<spec2-url>`

## What the smoke test does

1.  Call `lb4 app` to scaffold an application under `loopback-next/sandbox`
2.  Run `lerna bootstrap` to install/link dependencies for the application
3.  Call `lb4 openapi` to generate artifacts from an OpenAPI spec
4.  Run `npm run prettier:fix` to format the generated code
5.  Run `npm test` to verify the generated code compiles
