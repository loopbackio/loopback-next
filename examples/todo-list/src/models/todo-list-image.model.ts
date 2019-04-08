import {Entity, model, property, belongsToUniquely} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model()
export class TodoListImage extends Entity {
  @belongsToUniquely(() => TodoList)
  todoListId?: number;

  @property({
    required: true,
  })
  // Ideally we would use Buffer type here, but
  // that is not supported yet.
  // see https://github.com/strongloop/loopback-next/issues/1742
  value: string;

  constructor(data?: Partial<TodoListImage>) {
    super(data);
  }
}
