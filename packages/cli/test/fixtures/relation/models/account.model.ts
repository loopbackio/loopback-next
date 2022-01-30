import {Entity, model, property} from '@loopback/repository';

@model()
export class Account extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'number',
    default: 0,
  })
  balance?: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}
