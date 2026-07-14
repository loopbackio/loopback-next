import {Entity, model, property} from '@loopback/repository';

@model()
export class Friend1 extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  userId?: string;

  @property({
    type: 'string',
  })
  friendId?: string;

  constructor(data?: Partial<Friend1>) {
    super(data);
  }
}
