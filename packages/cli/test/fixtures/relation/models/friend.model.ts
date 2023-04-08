import {Entity, model, property} from '@loopback/repository';

@model()
export class Friend extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'number',
  })
  userId?: number;

  @property({
    type: 'number',
  })
  friendId?: number;

  constructor(data?: Partial<Friend>) {
    super(data);
  }
}
