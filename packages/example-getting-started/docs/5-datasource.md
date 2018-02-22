### Building a Datasource

Before we can begin constructing controllers and repositories for our
application, we need to define our datasource.

Create a new folder in the root directory of the project called `config`,
and then inside that folder, create a `datasources.json` file. For now, we'll
be using the memory connector provided with the Juggler.

#### config/datasources.json
```json
{
  "name": "ds",
  "connector": "memory"
}
```

Create another folder called `datasources` in the `src` directory, and inside
that folder, create a new file called `db.datasource.ts`.

#### src/datasources/db.datasource.ts

```ts
import * as path from 'path';
import * as fs from 'fs';
import { DataSourceConstructor, juggler } from '@loopback/repository';

const dsConfigPath = path.resolve('config', 'datasources.json');
const config = require(dsConfigPath);
export const db = new DataSourceConstructor(config);
```

This will give us a strongly-typed datasource export that we can work with to
construct our TodoRepository definition.

### Navigation

Previous step: [Add your Todo model](4-todo-model)

Next step: [Add a repository](6-repository)
