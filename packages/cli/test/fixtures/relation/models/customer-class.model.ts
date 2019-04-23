import {Entity, model, property} from '@loopback/repository';

@model()
export class CustomerClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<CustomerClass>) {
    super(data);
  }
}
