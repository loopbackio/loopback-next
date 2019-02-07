import {Entity, model, property} from '@loopback/repository';

@model()
export class Note extends Entity {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
  })
  content?: string;

  constructor(data?: Partial<Note>) {
    super(data);
  }
}
