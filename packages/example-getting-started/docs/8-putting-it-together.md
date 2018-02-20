### Putting it all together

Now that we've got all of our artifacts made, let's set them up in our
application!

We'll define a new helper function for setting up the repositories, as well
as adding in our new controller binding.

#### src/application.ts
```ts
import {ApplicationConfig} from '@loopback/core';
import {RestApplication} from '@loopback/rest';
import {TodoController, PingController} from './controllers';
import {
  Class,
  Repository,
  RepositoryMixin,
  DataSourceConstructor,
} from '@loopback/repository';
import {db} from './datasources/db.datasource';
import {TodoRepository} from './repositories';

export class TodoApplication extends RepositoryMixin(RestApplication) {
  constructor(options?: ApplicationConfig) {
    super(options);
    this.setupControllers();
    this.setupRepositories();
  }

  setupControllers() {
    this.controller(TodoController);
    this.controller(PingController);
  }

  setupRepositories() {
    // This will allow you to test your application without needing to
    // use the "real" datasource!
    const datasource =
      this.options && this.options.datasource
        ? new DataSourceConstructor(this.options.datasource)
        : db;
    this.bind('datasource').to(datasource);
    this.repository(TodoRepository);
  }
}
```

### Try it out

Now that your app is ready to go, try it out with your favourite REST client!
Start the app (`npm start`) and then make some REST requests:
- `POST /todo` with a body of `{ "title": "get the milk" }`
- `GET /todo/1` and see if you get your Todo object back.
- `PATCH /todo/1` with a body of `{ "desc": "need milk for cereal" }`

### Navigation

Previous step: [Add a controller](7-controller.html)

### More examples and tutorials

Eager to continue learning about LoopBack 4? Check out our
[examples and tutorials](https://loopback.io/doc/en/lb4/Examples-and-tutorials.html)
section to find examples for creating your own custom components, sequences and
more!

