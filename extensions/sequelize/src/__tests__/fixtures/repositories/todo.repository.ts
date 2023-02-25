import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {SequelizeCrudRepository} from '../../../sequelize';
import {DbDataSource} from '../datasources/db.datasource';
import {Todo, TodoList, TodoRelations} from '../models/index';
import {TodoListRepository} from './todo-list.repository';

export class TodoRepository extends SequelizeCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {
  public readonly todoList: BelongsToAccessor<
    TodoList,
    typeof Todo.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('TodoListRepository')
    protected todoListRepositoryGetter: Getter<TodoListRepository>,
  ) {
    super(Todo, dataSource);
    this.todoList = this.createBelongsToAccessorFor(
      'todoList',
      todoListRepositoryGetter,
    );
    this.registerInclusionResolver('todoList', this.todoList.inclusionResolver);
  }
}
