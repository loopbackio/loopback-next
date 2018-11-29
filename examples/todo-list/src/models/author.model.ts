import {Entity, model, property, belongsTo} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model()
export class Author extends Entity {
  @belongsTo(
    () => TodoList,
    {},
    {
      id: true,
      generated: false,
      type: 'string',
    },
  )
  todoListId: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  constructor(data?: Partial<Author>) {
    super(data);
  }
}
