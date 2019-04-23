import {Entity, model, property} from '@loopback/repository';

@model()
export class CustomerClassType extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  custNumber: number;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<CustomerClassType>) {
    super(data);
  }
}
