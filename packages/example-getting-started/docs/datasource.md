### Datasources

Datasources are LoopBack's way of connecting to various sources of data, such
as databases, APIs, message queues and more. In LoopBack 4, datasources can
be represented as strongly-typed objects and freely made available for
[injection](http://loopback.io/doc/en/lb4/Dependency-injection.html)
throughout the application. Typically, in LoopBack 4, datasources are used
in conjunction with
[Repositories](http://loopback.io/doc/en/lb4/Repositories.html) to provide
access to data.

Since our Todo API will need to persist instances of Todo items, we'll need to
create a datasource definition to make this possible.

### Building a Datasource

Create a new folder in the root directory of the project called `config`,
and then inside that folder, create a `datasources.json` file. For the purposes
of this tutorial, we'll be using the memory connector provided with the Juggler.

#### config/datasources.json
```json
{
  "name": "ds",
  "connector": "memory"
}
```

Create another folder called `datasources` in the `src` directory, and inside
that folder, create a new file called `db.datasource.ts`. This file will create
a strongly-typed export of our datasource using the `DataSourceConstructor`,
which we can consume in our application via injection.

#### src/datasources/db.datasource.ts

```ts
import * as path from 'path';
import * as fs from 'fs';
import { DataSourceConstructor, juggler } from '@loopback/repository';

const dsConfigPath = path.resolve('config', 'datasources.json');
const config = require(dsConfigPath);
export const db = new DataSourceConstructor(config);
```

Once you're ready, we'll move onto adding a [repository](repository.md) for
the datasource.

### Navigation

Previous step: [Add your Todo model](model.md)

Next step: [Add a repository](repository.md)
