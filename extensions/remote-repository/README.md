# @loopback/remote-repository

Access models persisted by a remote LoopBack application.

## Stability: ⚠️Experimental⚠️

> Experimental packages provide early access to advanced or experimental
> functionality to get community feedback. Such modules are published to npm
> using `0.x.y` versions. Their APIs and functionality may be subject to
> breaking changes in future releases.

## Installation

```sh
npm install --save @loopback/remote-repository
```

## Basic use

### Initial setup

Create a new DataSource using
[openapi connector](https://github.com/strongloop/loopback-connector-openapi),
configure it to connect to your remote LoopBack application.

**IMPORTANT: You must configure the datasource to use named parameters. Answer
the prompt _Use positional parameters instead of named parameters?_ with _n_.**

Copy model files from your remote LoopBack application to your local project. We
will need these model files for type information.

Create a new file `src/repositories/remote-crud.repository.base.ts` with the
following content:

```ts
export {RemoteCrudRepository} from '@loopback/remote-repository';
```

This will add `RemoteCrudRepository` to the list of base classes offered by
`lb4 repository` command.

### Setup a remote model

Run `lb4 repository` to create a new repository class for accessing the remote
model. Pick `RemoteCrudRepository` as the base class.

Run `lb4 relation` to establish relations between local and remote models.

You can also run `lb4 controller` to expose your remote model via a REST API of your local app, effectively making the local app a (smart) proxy.

## Known limitations

This extension is an early experimental prototype that's not feature complete,
we expect the community to contribute the features they are looking for. Please
join the discussion in
[loopback-next#5196](https://github.com/strongloop/loopback-next/issues/5196).
if you are interested.

- Only two CRUD operations are supported now: `find` and `create`, we should
  implement all operations described by LB4 `EntityCrudRepository`.

- The repository should report a helpful error when the remote server does not
  provide implementation of the operation invoked (e.g. because the method was
  deleted from the Controller class).

- The repository should check the OpenAPI spec to verify that the remote
  endpoint has the expected parameters (e.g. `filter` or `data`) and they are
  described using the expected schema (filter type, model data).

- Support LoopBack 3. The OpenAPI connector can talk to Swagger-based APIs, we
  need to find out how to automatically create LB4 model classes from LB3 model
  definitions and/or Swagger schema. `lb4 openapi —client` may help.

- Nice to have: the repository should verify that the datasource is using
  openapi connector configured to use named parameters.

- Nice to have: support KeyValue persistence style.

## Contributions

- [Guidelines](https://github.com/strongloop/loopback-next/blob/master/docs/CONTRIBUTING.md)
- [Join the team](https://github.com/strongloop/loopback-next/issues/110)

## Tests

Run `npm test` from the root folder.

## Contributors

See
[all contributors](https://github.com/strongloop/loopback-next/graphs/contributors).

## License

MIT
