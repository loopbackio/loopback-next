import {
  Entity,
  hasMany,
  model,
  property,
  belongsTo,
} from '@loopback/repository';
import {Todo} from './todo.model';
import {User} from './user.model';

@model()
export class TodoList extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @hasMany(() => Todo, {
    keyTo: 'todoListId',
  })
  todos: Todo[];

  @belongsTo(
    () => User,
    {
      keyTo: 'id',
      keyFrom: 'userId',
    },
    {
      type: 'number',
    },
  )
  userId?: number;

  constructor(data?: Partial<TodoList>) {
    super(data);
  }
}

export interface TodoListRelations {
  // describe navigational properties here
}

export type TodoListWithRelations = TodoList & TodoListRelations;
