import {Entity, model, property} from '@loopback/repository';

@model()
export class Order extends Entity {
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
    type: 'string',
    readOnly: true,
  })
  token?: string;

  constructor(data?: Partial<Order>) {
    super(data);
  }
}
