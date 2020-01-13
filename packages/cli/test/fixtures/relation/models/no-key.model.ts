import {Entity, model, property} from '@loopback/repository';

@model()
export class NoKey extends Entity {
  @property({
    type: 'number',
    default: 0,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  constructor(data?: Partial<NoKey>) {
    super(data);
  }
}
