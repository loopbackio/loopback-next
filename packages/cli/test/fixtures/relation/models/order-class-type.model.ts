import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  orderString: string;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<OrderClassType>) {
    super(data);
  }
}
