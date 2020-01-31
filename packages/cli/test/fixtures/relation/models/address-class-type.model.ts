import {Entity, model, property} from '@loopback/repository';

@model()
export class AddressClassType extends Entity {
  @property({
    type: 'string',
    id: true,
  })
  addressString: string;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<AddressClassType>) {
    super(data);
  }
}
