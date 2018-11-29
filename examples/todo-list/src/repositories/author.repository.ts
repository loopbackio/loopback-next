import {
  DefaultCrudRepository,
  juggler,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
import {Author, TodoList} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {TodoListRepository} from './todo-list.repository';

export class AuthorRepository extends DefaultCrudRepository<
  Author,
  typeof Author.prototype.todoListId
> {
  public readonly todoList: BelongsToAccessor<
    TodoList,
    typeof Author.prototype.todoListId
  >;
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('TodoListRepository')
    protected todoListRepositoryGetter: Getter<TodoListRepository>,
  ) {
    super(Author, dataSource);
    this.todoList = this._createBelongsToAccessorFor(
      'todoList',
      todoListRepositoryGetter,
    );
  }
}
