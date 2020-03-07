# @loopback/example-rest-crud

This is a basic example demonstrating how to use the default CRUD REST
repository and controller with a single model class and datasource.

## Overview

The
[Todo example](https://github.com/strongloop/loopback-next/tree/master/examples/todo)
can be simplified to use the default repository and controller classes provided
by `@loopback/rest-crud`. With this package, there's no longer a need to define
a repository or controller class for a model.

Given a `Todo` model and `db` datasource, create
`src/model-endpoints/todo.rest-config.ts` and add the following configuration to
it:

```ts
import {ModelCrudRestApiConfig} from '@loopback/rest-crud';
import {Todo} from '../models';

module.exports = <ModelCrudRestApiConfig>{
  model: Todo,
  pattern: 'CrudRest',
  dataSource: 'db',
  basePath: '/todos',
};
```

The `pattern` `CrudRest` means it will use the default CRUD REST repository and
controller classes. The `dataSource` should correspond to the datasource you
want to use with this model. Finally, the `basePath` should refer to the base
path the controller will use.

Add the following import to `src/application.ts`:

```ts
import {CrudRestComponent} from '@loopback/rest-crud';
```

And the folowing component to the application constructor:

```ts
this.component(CrudRestComponent);
```

And there you go! Now the application should behave almost the same as the Todo
example (with the exception of the geocoder service).

You can run the application by running the following from the root directory:

```
$ npm start

Server is running at http://127.0.0.1:3000
```

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
