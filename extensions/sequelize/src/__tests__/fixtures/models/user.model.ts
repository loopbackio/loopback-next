import {Entity, hasOne, model, property} from '@loopback/repository';
import {TodoList} from './todo-list.model';

@model()
export class Address extends Entity {
  @property({
    type: 'string',
  })
  city: string;

  @property({
    type: 'number',
  })
  zipCode: number;
}

@model()
export class User extends Entity {
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
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property.array('string', {
    name: 'phone_numbers',
  })
  phoneNumbers: string[];

  @property({
    type: 'boolean',
    default: false,
    name: 'is_active',
  })
  active?: boolean;

  @property({
    type: 'object',
    postgresql: {
      dataType: 'json',
    },
  })
  address: Address;

  @property({
    type: 'string',
    hidden: true,
  })
  password?: string;

  @property({
    type: 'date',
  })
  dob?: Date;

  @hasOne(() => TodoList, {keyTo: 'userId'})
  todoList: TodoList;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
