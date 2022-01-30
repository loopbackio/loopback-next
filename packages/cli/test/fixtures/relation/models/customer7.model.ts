import {Entity, model, property} from '@loopback/repository';

@model()
export class Customer extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'array',
  })
  accountIds: number[];

  constructor(data?: Partial<Customer>) {
    super(data);
  }
}
