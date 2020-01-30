import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClass extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  addressNumber?: number;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<AddressClass>) {
    super(data);
  }
}
