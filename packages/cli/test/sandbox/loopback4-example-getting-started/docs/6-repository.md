### Create your repository

Create another folder in `src` called `repositories` and inside of that folder,
create two files:
- `index.ts` (our export helper)
- `todo.repository.ts`

Our TodoRepository will contain a small base class that uses the
`DefaultCrudRepository` class from `@loopback/repository` and will define the
model type we're working with, as well as its ID type. We'll also inject our
datasource so that this repository can connect to it when executing data
operations.

#### src/repositories/todo.repository.ts
```ts
import { DefaultCrudRepository, DataSourceType } from '@loopback/repository';
import { Todo } from '../models';
import { inject } from '@loopback/core';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id
> {
  constructor(@inject('datasource') protected datasource: DataSourceType) {
    super(Todo, datasource);
  }
}
```
