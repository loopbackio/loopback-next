import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  orderNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<OrderClass>) {
    super(data);
  }
}
