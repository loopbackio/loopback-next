import {Entity, model, property} from '@loopback/repository';

@model()
export class OrderCustomRefKey extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  customerCode?: string;

  @property({
    type: 'string',
  })
  productSku?: string;

  @property({
    type: 'number',
  })
  quantity?: number;

  constructor(data?: Partial<OrderCustomRefKey>) {
    super(data);
  }
}
