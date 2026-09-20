import {Entity, model, property} from '@loopback/repository';

@model()
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
    index: {unique: true},
  })
  sku?: string;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}
