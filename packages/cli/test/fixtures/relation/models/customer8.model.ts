import {Entity, model, property} from '@loopback/repository';

@model()
export class Customer8 extends Entity {
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
  customerCode?: string;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<Customer8>) {
    super(data);
  }
}
