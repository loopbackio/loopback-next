import {Getter, inject} from '@loopback/core';
import {
  HasManyRepositoryFactory,
  repository,
  type BelongsToAccessor,
} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {PrimaryDataSource} from '../datasources/primary.datasource';
import {Todo, TodoList, TodoListRelations, User} from '../models/index';
import {TodoRepository} from './todo.repository';
import {UserRepository} from './user.repository';

export class TodoListRepository extends SequelizeCrudRepository<
  TodoList,
  typeof TodoList.prototype.id,
  TodoListRelations
> {
  public readonly todos: HasManyRepositoryFactory<
    Todo,
    typeof TodoList.prototype.id
  >;

  public readonly user: BelongsToAccessor<User, typeof TodoList.prototype.id>;

  constructor(
    @inject('datasources.primary') dataSource: PrimaryDataSource,
    @repository.getter('TodoRepository')
    protected todoRepositoryGetter: Getter<TodoRepository>,
    @repository.getter('UserRepository')
    protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(TodoList, dataSource);
    this.todos = this.createHasManyRepositoryFactoryFor(
      'todos',
      todoRepositoryGetter,
    );
    this.registerInclusionResolver('todos', this.todos.inclusionResolver);

    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}
